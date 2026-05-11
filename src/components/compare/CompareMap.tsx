import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type D3ZoomEvent } from 'd3-zoom';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { MapTooltip } from '@/components/visualisations/MapTooltip';
import { MissingPolygonMarkers } from '@/components/visualisations/MissingPolygonMarkers';
import type { Country } from '@/types';
import { ISO_NUMERIC_TO_ALPHA3 } from '@/types/geo';
import { COMPARE_COLORS } from './CompareCard';

interface CountryFeature extends Feature<Geometry> {
  id: string;
}

/** Zoom constraints */
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

/**
 * Map component for Compare mode
 * Shows all countries with compared countries highlighted by number/color
 */
export const CompareMap = () => {
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
  const comparisonCountries = useAtlasStore((state) => state.comparisonCountries);
  const addToComparison = useAtlasStore((state) => state.addToComparison);
  const removeFromComparison = useAtlasStore((state) => state.removeFromComparison);
  const hoveredCountry = useAtlasStore((state) => state.hoveredCountry);
  const hoverCountry = useAtlasStore((state) => state.hoverCountry);
  const theme = useAtlasStore((state) => state.theme);

  const isDark = theme === 'dark';

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

  // Handle resize
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

  // Initialize D3 zoom behavior
  useEffect(() => {
    if (!svgRef.current || !gRef.current || dimensions.width === 0) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const { width, height } = dimensions;

    const panPadding = 100;

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .translateExtent([
        [-panPadding, -panPadding],
        [width + panPadding, height + panPadding]
      ])
      .extent([
        [0, 0],
        [width, height]
      ])
      .filter((event) => {
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

    svg.on('.zoom', null);
    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior.transform, zoomIdentity);

    return () => {
      svg.on('.zoom', null);
    };
  }, [dimensions, topoData]);

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
    svg.transition().duration(500).call(zoomBehaviorRef.current.transform, zoomIdentity);
  }, []);

  const hoveredCountryData = hoveredCountry ? countryMap.get(hoveredCountry) : null;

  const getAlpha3Code = useCallback((numericId: string): string => {
    return ISO_NUMERIC_TO_ALPHA3[numericId] ?? numericId;
  }, []);

  const handleCountryMouseMove = useCallback(
    (event: React.MouseEvent, featureId: string) => {
      if (isDragging) return;
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
    [isDragging, getAlpha3Code, hoverCountry]
  );

  const handleCountryMouseLeave = useCallback(() => {
    hoverCountry(null);
    setMousePosition(null);
  }, [hoverCountry]);

  const handleCountryClick = useCallback(
    (event: React.MouseEvent, featureId: string) => {
      if (isDragging) return;
      event.stopPropagation();
      const alpha3 = getAlpha3Code(featureId);
      const country = countryMap.get(alpha3);
      
      if (!country) return; // No data for this country
      
      // Toggle comparison
      if (comparisonCountries.includes(alpha3)) {
        removeFromComparison(alpha3);
      } else {
        addToComparison(alpha3);
      }
    },
    [isDragging, getAlpha3Code, countryMap, comparisonCountries, addToComparison, removeFromComparison]
  );

  // Create projection and path generator
  const { projection, pathGenerator, features, centroids } = useMemo(() => {
    if (!topoData || dimensions.width === 0 || dimensions.height === 0) {
      return { projection: null, pathGenerator: null, features: [], centroids: new Map() };
    }

    const { width, height } = dimensions;
    const padding = 30;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scaleByWidth = availableWidth / 5.5;
    const scaleByHeight = availableHeight / 2.8;
    const scale = Math.min(scaleByWidth, scaleByHeight);

    const proj = geoNaturalEarth1().scale(scale).translate([width / 2, height / 2]);
    const path = geoPath().projection(proj);

    const countriesObj = topoData.objects['countries'] as GeometryCollection;
    const feats = topojson.feature(topoData, countriesObj).features as CountryFeature[];

    const centroidMap = new Map<string, [number, number]>();
    feats.forEach((feature) => {
      const centroid = path.centroid(feature);
      if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
        const alpha3 = ISO_NUMERIC_TO_ALPHA3[String(feature.id)] ?? String(feature.id);
        centroidMap.set(alpha3, centroid);
      }
    });

    return { projection: proj, pathGenerator: path, features: feats, centroids: centroidMap };
  }, [topoData, dimensions]);

  // Get fill color based on comparison state
  const getCountryFill = (countryId: string): string => {
    const index = comparisonCountries.indexOf(countryId);
    const hasData = countryMap.has(countryId);
    
    if (index !== -1 && index < COMPARE_COLORS.length) {
      // Country is in comparison - use its assigned color
      return COMPARE_COLORS[index] ?? '#3B82F6';
    }
    
    if (!hasData) {
      // No data for this country
      return isDark ? '#2A2A2A' : '#D4D4D4';
    }
    
    // Country has data but not in comparison - dimmed
    return isDark ? 'rgba(80, 80, 80, 0.5)' : 'rgba(180, 180, 180, 0.6)';
  };

  const strokeColor = isDark ? '#404040' : '#BEBEBE';
  const hoverStrokeColor = isDark ? '#A3A3A3' : '#737373';

  // Loading state
  if (!topoData || !pathGenerator || !projection) {
    return (
      <div 
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center bg-bg-primary"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-accent-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-accent-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-accent-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
            />
          </div>
          <span className="text-sm text-text-secondary">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex flex-col bg-bg-primary"
    >
      <div className="flex-1 relative overflow-hidden min-h-0">
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
          {/* Definitions */}
          <defs>
            {/* Glow filter for compared countries */}
            <filter id="compareGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow 
                dx="0" 
                dy="0" 
                stdDeviation="3" 
                floodColor="white"
                floodOpacity="0.5"
              />
            </filter>
          </defs>

          {/* Ocean background */}
          <rect
            width={dimensions.width}
            height={dimensions.height}
            fill={isDark ? '#0a0a0a' : '#f5f5f5'}
            className="ocean-background"
          />

          {/* Country paths */}
          <g ref={gRef} className="map-group">
            {features.map((feature) => {
              const featureId = String(feature.id);
              const alpha3 = getAlpha3Code(featureId);
              const country = countryMap.get(alpha3);
              const isHovered = hoveredCountry === alpha3 && !isDragging;
              const isInComparison = comparisonCountries.includes(alpha3);

              const fillColor = getCountryFill(alpha3);
              const pathD = pathGenerator(feature);
              if (!pathD) return null;

              return (
                <path
                  key={featureId}
                  data-country={alpha3}
                  d={pathD}
                  fill={fillColor}
                  stroke={
                    isInComparison
                      ? 'white'
                      : isHovered
                      ? hoverStrokeColor
                      : strokeColor
                  }
                  strokeWidth={isInComparison ? 2 : isHovered ? 1.5 : 0.5}
                  filter={isInComparison ? 'url(#compareGlow)' : undefined}
                  style={{
                    cursor: country && !isDragging ? 'pointer' : 'inherit',
                    transition: 'fill 0.2s ease-out, stroke 0.2s ease-out',
                  }}
                  onMouseMove={(e) => handleCountryMouseMove(e, featureId)}
                  onMouseLeave={handleCountryMouseLeave}
                  onClick={(e) => handleCountryClick(e, featureId)}
                />
              );
            })}

            {/* Number badges for compared countries */}
            {comparisonCountries.map((countryId, index) => {
              const centroid = centroids.get(countryId);
              if (!centroid) return null;

              return (
                <g
                  key={`badge-${countryId}`}
                  transform={`translate(${centroid[0]}, ${centroid[1]})`}
                  style={{ pointerEvents: 'none' }}
                >
                  <circle r="14" fill={COMPARE_COLORS[index]} stroke="white" strokeWidth="2" />
                  <text
                    textAnchor="middle"
                    dy="5"
                    fill="white"
                    fontSize="13"
                    fontWeight="bold"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {index + 1}
                  </text>
                </g>
              );
            })}

            {/* EU and Singapore have no polygon — render markers so they
                 can be hovered, selected, and shown as comparison badges. */}
            <MissingPolygonMarkers
              projection={projection}
              countries={countryMap}
              mode="risk"
              isDark={isDark}
              bivariateBreaks={{ hazard: [0.33, 0.66], displacement: [0.33, 0.66] }}
              hoveredId={hoveredCountry}
              onHover={(id) => {
                if (!isDragging) hoverCountry(id);
              }}
              onClick={(id) => {
                if (isDragging) return;
                if (comparisonCountries.includes(id)) removeFromComparison(id);
                else if (countryMap.has(id)) addToComparison(id);
              }}
              overrideFill={(c) => {
                const idx = comparisonCountries.indexOf(c.id);
                if (idx !== -1) return COMPARE_COLORS[idx] ?? '#3B82F6';
                return isDark ? 'rgba(80, 80, 80, 0.5)' : 'rgba(180, 180, 180, 0.6)';
              }}
              compareBadge={(id) => {
                const idx = comparisonCountries.indexOf(id);
                if (idx === -1) return null;
                return { color: COMPARE_COLORS[idx] ?? '#3B82F6', index: idx };
              }}
            />
          </g>
        </svg>

        {/* Vignette overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark 
              ? 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
              : 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)'
          }}
        />

        {/* Zoom controls */}
        <motion.div 
          className="
            absolute bottom-6 right-6 z-20
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
          >
            <Maximize2 className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Zoom indicator */}
        {currentZoom > 1 && (
          <div className="absolute bottom-5 left-5 px-2.5 py-1 rounded-lg bg-bg-secondary/90 backdrop-blur-sm text-xs font-mono text-text-secondary border border-border-subtle z-20">
            {currentZoom.toFixed(1)}×
          </div>
        )}

        {/* Tooltip */}
        {!isDragging && (
          <MapTooltip
            country={hoveredCountryData ?? null}
            mapMode="risk"
            mousePosition={mousePosition}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
          />
        )}
      </div>
    </div>
  );
};

