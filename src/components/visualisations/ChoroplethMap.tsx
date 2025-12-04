import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type D3ZoomEvent } from 'd3-zoom';
import { scaleQuantize } from 'd3-scale';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { MapTooltip } from './MapTooltip';
import { MapLegend } from './MapLegend';
import type { Country, ActivePillar } from '@/types';
import { ISO_NUMERIC_TO_ALPHA3 } from '@/types/geo';
import { PILLAR_SCALES_DARK, PILLAR_SCALES_LIGHT, RISK_SCALE } from '@/utils/pillarScales';

interface ChoroplethMapProps {
  interactive?: boolean;
}

interface CountryFeature extends Feature<Geometry> {
  id: string;
}

/** Zoom constraints */
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

/** Panel width for viewport compensation */
const PANEL_WIDTH = 380;

/**
 * Get colour for a country based on its score and active pillar
 */
const getCountryColor = (
  country: Country | undefined,
  pillar: ActivePillar,
  isDark: boolean
): string => {
  if (!country) {
    return isDark ? '#2A2A2A' : '#D4D4D4';
  }

  const value = pillar === 'risk' ? country.riskImbalance : country[pillar].overall;
  const pillarScales = isDark ? PILLAR_SCALES_DARK : PILLAR_SCALES_LIGHT;

  if (pillar === 'risk') {
    const normalized = (Math.max(-0.5, Math.min(0.5, value)) + 0.5) / 1;
    const scale = scaleQuantize<string>().domain([0, 1]).range(RISK_SCALE);
    return scale(normalized);
  }

  const scale = scaleQuantize<string>().domain([0, 1]).range([...pillarScales[pillar]]);
  return scale(value);
};

/**
 * Interactive choropleth world map component with pan & zoom
 */
export const ChoroplethMap = ({ interactive = true }: ChoroplethMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  const [topoData, setTopoData] = useState<Topology | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // Store state
  const countries = useAtlasStore((state) => state.countries);
  const activePillar = useAtlasStore((state) => state.activePillar);
  const activeClusterFilter = useAtlasStore((state) => state.activeClusterFilter);
  const hoveredCountry = useAtlasStore((state) => state.hoveredCountry);
  const selectedCountry = useAtlasStore((state) => state.selectedCountry);
  const theme = useAtlasStore((state) => state.theme);
  const hoverCountry = useAtlasStore((state) => state.hoverCountry);
  const selectCountry = useAtlasStore((state) => state.selectCountry);

  const isDark = theme === 'dark';
  
  // Determine if country panel is open (for viewport compensation)
  const countryPanelOpen = useAtlasStore((state) => state.countryPanelOpen);

  // Create country lookup map
  const countryMap = useMemo(() => {
    const map = new Map<string, Country>();
    countries.forEach((c) => map.set(c.id, c));
    return map;
  }, [countries]);

  // Load TopoJSON data
  useEffect(() => {
    fetch('/data/world-110m.json')
      .then((res) => res.json())
      .then((data: Topology) => setTopoData(data))
      .catch((err) => console.error('Failed to load TopoJSON:', err));
  }, []);

  // Handle resize - fill available space
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: rect.width, 
          height: rect.height 
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize and update D3 zoom behavior
  useEffect(() => {
    if (!svgRef.current || !gRef.current || !interactive || dimensions.width === 0) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const { width, height } = dimensions;

    // Pan limits - allow some movement but keep map mostly visible
    const panPadding = 100;

    // Create zoom behavior with proper constraints
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      // translateExtent constrains panning - map stays within these bounds
      .translateExtent([
        [-panPadding, -panPadding],
        [width + panPadding, height + panPadding]
      ])
      // extent defines the viewport
      .extent([
        [0, 0],
        [width, height]
      ])
      .filter((event) => {
        // Allow wheel zoom (even with ctrl), left-click drag, and double-click
        // Prevent right-click from triggering zoom
        if (event.type === 'dblclick') return true;
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
      })
      .on('start', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (event.sourceEvent?.type === 'mousedown' || event.sourceEvent?.type === 'touchstart') {
          setIsDragging(true);
        }
      })
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
        setCurrentZoom(event.transform.k);
      })
      .on('end', () => {
        setIsDragging(false);
      });

    // Remove any existing zoom behavior first
    svg.on('.zoom', null);
    
    // Apply zoom behavior
    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    // Set initial transform (centered, zoom 1)
    svg.call(zoomBehavior.transform, zoomIdentity);

    return () => {
      svg.on('.zoom', null);
    };
  }, [interactive, dimensions, topoData]);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1 / 1.5);
  }, []);

  const handleResetView = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current);
    // Smooth transition back to identity (centered, zoom 1)
    svg.transition().duration(500).call(zoomBehaviorRef.current.transform, zoomIdentity);
  }, []);

  const hoveredCountryData = hoveredCountry ? countryMap.get(hoveredCountry) : null;

  const getAlpha3Code = useCallback((numericId: string): string => {
    return ISO_NUMERIC_TO_ALPHA3[numericId] ?? numericId;
  }, []);

  const passesFilter = useCallback(
    (countryId: string): boolean => {
      if (!activeClusterFilter) return true;
      const country = countryMap.get(countryId);
      return country?.clusterId === activeClusterFilter;
    },
    [activeClusterFilter, countryMap]
  );

  const handleCountryMouseMove = useCallback(
    (event: React.MouseEvent, featureId: string) => {
      if (!interactive || isDragging) return;
      const alpha3 = getAlpha3Code(featureId);
      hoverCountry(alpha3);
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    },
    [interactive, isDragging, getAlpha3Code, hoverCountry]
  );

  const handleCountryMouseLeave = useCallback(() => {
    if (!interactive) return;
    hoverCountry(null);
    setMousePosition(null);
  }, [interactive, hoverCountry]);

  const handleCountryClick = useCallback(
    (event: React.MouseEvent, featureId: string) => {
      if (!interactive || isDragging) return;
      event.stopPropagation();
      const alpha3 = getAlpha3Code(featureId);
      const country = countryMap.get(alpha3);
      if (country) {
        // Country has data - select it
        selectCountry(alpha3);
      } else {
        // Country has no data (grey) - close panel
        selectCountry(null);
      }
    },
    [interactive, isDragging, getAlpha3Code, countryMap, selectCountry]
  );

  // Create projection and path generator - scale to fit container nicely
  const { pathGenerator, features } = useMemo(() => {
    if (!topoData || dimensions.width === 0 || dimensions.height === 0) {
      return { pathGenerator: null, features: [] };
    }

    const { width, height } = dimensions;
    
    // Padding around the map
    const padding = 30;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;
    
    // Natural Earth projection aspect ratio is roughly 2:1
    // Calculate scale to fit map in container with good framing
    const scaleByWidth = availableWidth / 5.5;
    const scaleByHeight = availableHeight / 2.8;
    const scale = Math.min(scaleByWidth, scaleByHeight);

    // Create projection centered in the container
    const proj = geoNaturalEarth1()
      .scale(scale)
      .translate([width / 2, height / 2]);

    const path = geoPath().projection(proj);

    const countriesObj = topoData.objects['countries'] as GeometryCollection;
    const feats = topojson.feature(topoData, countriesObj).features as CountryFeature[];

    return { pathGenerator: path, features: feats };
  }, [topoData, dimensions]);

  const strokeColor = isDark ? '#404040' : '#BEBEBE';
  const hoverStrokeColor = isDark ? '#A3A3A3' : '#737373';
  // White selection stroke - neutral, works with all pillar colors
  const selectedStrokeColor = 'rgba(255, 255, 255, 0.9)';

  const hasFilteredResults = useMemo(() => {
    if (!activeClusterFilter) return true;
    return countries.some((c) => c.clusterId === activeClusterFilter);
  }, [activeClusterFilter, countries]);

  // Loading state
  if (!topoData || !pathGenerator) {
    return (
      <div 
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center bg-bg-primary"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-pillar-build"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-pillar-break"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-pillar-balance"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
            />
          </div>
          <span className="text-sm text-text-secondary">Loading map data...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex flex-col bg-bg-primary"
    >
      {/* Map SVG - fills available space, shifts left when panel opens */}
      <div 
        className="flex-1 relative overflow-hidden min-h-0 transition-transform duration-300 ease-out" 
        data-map-container
        style={{
          // Shift map left by half the panel width when panel is open
          // This keeps the visual center accessible
          transform: countryPanelOpen ? `translateX(-${PANEL_WIDTH / 2}px)` : 'translateX(0)',
        }}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block select-none absolute inset-0"
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
        >
          {/* Definitions for effects */}
          <defs>
            {/* White glow for selected countries - neutral, professional */}
            <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow 
                dx="0" 
                dy="0" 
                stdDeviation="4" 
                floodColor="white"
                floodOpacity="0.6"
              >
                <animate
                  attributeName="floodOpacity"
                  values="0.4;0.7;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </feDropShadow>
            </filter>
            
            {/* Hover glow filter */}
            <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ocean background - clean solid fill */}
          <rect
            width={dimensions.width}
            height={dimensions.height}
            fill={isDark ? '#0a0a0a' : '#f5f5f5'}
            className="ocean-background"
            style={{ pointerEvents: 'all', cursor: 'default' }}
            onClick={() => {
              if (interactive && selectedCountry) {
                selectCountry(null);
              }
            }}
          />

          {/* Country paths - wrapped in group for zoom transform */}
          <g ref={gRef} className="map-group">
            {features.map((feature) => {
              const featureId = String(feature.id);
              const alpha3 = getAlpha3Code(featureId);
              const country = countryMap.get(alpha3);
              const isHovered = hoveredCountry === alpha3 && !isDragging;
              const isSelected = selectedCountry === alpha3;
              const passFilter = passesFilter(alpha3);

              const fillColor = getCountryColor(country, activePillar, isDark);
              const opacity = country ? (passFilter ? 1 : 0.12) : 1;

              const pathD = pathGenerator(feature);
              if (!pathD) return null;

              return (
                <path
                  key={featureId}
                  data-country={alpha3}
                  className={`
                    country-path
                    ${isSelected ? 'country-selected' : ''}
                  `}
                  d={pathD}
                  fill={fillColor}
                  fillOpacity={opacity}
                  stroke={
                    isSelected
                      ? selectedStrokeColor
                      : isHovered
                      ? hoverStrokeColor
                      : strokeColor
                  }
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 0.5}
                  filter={isSelected ? 'url(#selectedGlow)' : undefined}
                  style={{
                    cursor: interactive && country && !isDragging ? 'pointer' : 'inherit',
                  }}
                  onMouseMove={(e) => handleCountryMouseMove(e, featureId)}
                  onMouseLeave={handleCountryMouseLeave}
                  onClick={(e) => handleCountryClick(e, featureId)}
                />
              );
            })}
          </g>
        </svg>

        {/* Vignette overlay for depth */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark 
              ? 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
              : 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)'
          }}
        />

        {/* No results overlay */}
        {!hasFilteredResults && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm z-10">
            <div className="text-center p-6 rounded-xl bg-bg-secondary border border-border-subtle shadow-lg">
              <p className="text-text-secondary mb-3">No countries match current filters</p>
              <button
                onClick={() => useAtlasStore.getState().setClusterFilter(null)}
                className="
                  px-4 py-2 rounded-lg
                  bg-accent-primary text-white text-sm font-medium
                  hover:bg-accent-hover
                  transition-colors
                "
              >
                Reset filters
              </button>
            </div>
          </div>
        )}

        {/* Zoom controls - glass container */}
        {interactive && (
          <motion.div 
            className="
              absolute bottom-24 right-6 z-20
              p-1.5 rounded-xl
              bg-bg-secondary/80 backdrop-blur-xl
              border border-border-subtle
              shadow-xl
              flex flex-col gap-1.5
            "
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={handleZoomIn}
              disabled={currentZoom >= MAX_ZOOM}
              className="
                w-10 h-10 rounded-lg
                flex items-center justify-center
                text-text-secondary hover:text-text-primary
                hover:bg-bg-primary
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-150
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={handleZoomOut}
              disabled={currentZoom <= MIN_ZOOM}
              className="
                w-10 h-10 rounded-lg
                flex items-center justify-center
                text-text-secondary hover:text-text-primary
                hover:bg-bg-primary
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-150
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
            <div className="h-px bg-border-subtle/50 mx-1" />
            <motion.button
              onClick={handleResetView}
              disabled={currentZoom === 1}
              className="
                w-10 h-10 rounded-lg
                flex items-center justify-center
                text-text-secondary hover:text-text-primary
                hover:bg-bg-primary
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-150
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Reset view"
              title="Reset view"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Zoom level indicator */}
        {interactive && currentZoom > 1 && (
          <div className="absolute bottom-5 left-5 px-2.5 py-1 rounded-lg bg-bg-secondary/90 backdrop-blur-sm text-xs font-mono text-text-secondary border border-border-subtle z-20">
            {currentZoom.toFixed(1)}×
          </div>
        )}

        {/* Tooltip */}
        {interactive && !isDragging && (
          <MapTooltip
            country={hoveredCountryData ?? null}
            activePillar={activePillar}
            mousePosition={mousePosition}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
          />
        )}
      </div>

      {/* Legend - fixed at bottom */}
      <div className="shrink-0 py-3 px-4 flex justify-center bg-bg-primary">
        <MapLegend activePillar={activePillar} />
      </div>
    </div>
  );
};
