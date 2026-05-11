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
import { MissingPolygonMarkers } from './MissingPolygonMarkers';
import type { Country, MapMode } from '@/types';
import { ISO_NUMERIC_TO_ALPHA3 } from '@/types/geo';
import { getRampForMode } from '@/utils/pillarScales';
import { getClusterColor, tertileBreaks, bivariateColor } from '@/utils/scales';
import { valueForMode } from '@/utils/dataLoader';

interface ChoroplethMapProps {
  interactive?: boolean;
}

interface CountryFeature extends Feature<Geometry> {
  id: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const PANEL_WIDTH = 380;

/**
 * Sovereignty values are mathematically restricted to [0.5, 1.0]. Using a
 * [0, 1] domain on the quantize scale wastes half the colour ramp and collapses
 * USA (0.92) and the no-cloud cluster (1.0) into the same bucket.
 */
const domainForMode = (mode: MapMode): [number, number] => {
  if (mode === 'sovereignty') return [0.5, 1];
  return [0, 1];
};

/**
 * Pick a fill colour for a country given the active map mode. Continuous modes
 * use a quantized 5-bucket scale; categorical (clusters) and bivariate modes
 * use their dedicated palettes.
 */
const getCountryColor = (
  country: Country | undefined,
  mode: MapMode,
  isDark: boolean,
  bivariateBreaks: { hazard: [number, number]; displacement: [number, number] }
): string => {
  if (!country) return isDark ? '#2A2A2A' : '#D4D4D4';

  if (mode === 'clusters') return getClusterColor(country.cluster.id);
  if (mode === 'bivariate') {
    return bivariateColor(country.build.hazard, country.break.displacement, bivariateBreaks);
  }

  const ramp = [...getRampForMode(mode, isDark)];
  const value = valueForMode(country, mode as Exclude<MapMode, 'bivariate' | 'clusters'>);
  const scale = scaleQuantize<string>().domain(domainForMode(mode)).range(ramp);
  return scale(value);
};

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

  const countries = useAtlasStore((state) => state.countries);
  const mapMode = useAtlasStore((state) => state.mapMode);
  const activeClusterFilter = useAtlasStore((state) => state.activeClusterFilter);
  const hoveredCountry = useAtlasStore((state) => state.hoveredCountry);
  const selectedCountry = useAtlasStore((state) => state.selectedCountry);
  const theme = useAtlasStore((state) => state.theme);
  const hoverCountry = useAtlasStore((state) => state.hoverCountry);
  const selectCountry = useAtlasStore((state) => state.selectCountry);

  const isDark = theme === 'dark';
  const countryPanelOpen = useAtlasStore((state) => state.countryPanelOpen);

  const countryMap = useMemo(() => {
    const map = new Map<string, Country>();
    countries.forEach((c) => map.set(c.id, c));
    return map;
  }, [countries]);

  /** Tertile breaks for the bivariate mode, recomputed on data change. */
  const bivariateBreaks = useMemo(
    () => ({
      hazard: tertileBreaks(countries.filter((c) => !c.flags.isSupranational).map((c) => c.build.hazard)),
      displacement: tertileBreaks(
        countries.filter((c) => !c.flags.isSupranational).map((c) => c.break.displacement)
      ),
    }),
    [countries]
  );

  useEffect(() => {
    fetch('/data/world-110m.json')
      .then((res) => res.json())
      .then((data: Topology) => setTopoData(data))
      .catch((err) => console.error('Failed to load TopoJSON:', err));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !interactive || dimensions.width === 0) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const { width, height } = dimensions;
    const panPadding = 100;

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .translateExtent([
        [-panPadding, -panPadding],
        [width + panPadding, height + panPadding],
      ])
      .extent([
        [0, 0],
        [width, height],
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
      .on('end', () => setIsDragging(false));

    svg.on('.zoom', null);
    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior.transform, zoomIdentity);

    return () => {
      svg.on('.zoom', null);
    };
  }, [interactive, dimensions, topoData]);

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1 / 1.5);
  }, []);

  const handleResetView = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current).transition().duration(500).call(zoomBehaviorRef.current.transform, zoomIdentity);
  }, []);

  const hoveredCountryData = hoveredCountry ? countryMap.get(hoveredCountry) : null;

  const getAlpha3Code = useCallback((numericId: string): string => {
    return ISO_NUMERIC_TO_ALPHA3[numericId] ?? numericId;
  }, []);

  const passesFilter = useCallback(
    (countryId: string): boolean => {
      if (activeClusterFilter === null) return true;
      const country = countryMap.get(countryId);
      return country?.cluster.id === activeClusterFilter;
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
        setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
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
      selectCountry(country ? alpha3 : null);
    },
    [interactive, isDragging, getAlpha3Code, countryMap, selectCountry]
  );

  const { projection, pathGenerator, features } = useMemo(() => {
    if (!topoData || dimensions.width === 0 || dimensions.height === 0) {
      return { projection: null, pathGenerator: null, features: [] };
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
    return { projection: proj, pathGenerator: path, features: feats };
  }, [topoData, dimensions]);

  const strokeColor = isDark ? '#404040' : '#BEBEBE';
  const hoverStrokeColor = isDark ? '#A3A3A3' : '#737373';
  const selectedStrokeColor = 'rgba(255, 255, 255, 0.9)';

  const hasFilteredResults = useMemo(() => {
    if (activeClusterFilter === null) return true;
    return countries.some((c) => c.cluster.id === activeClusterFilter);
  }, [activeClusterFilter, countries]);

  if (!topoData || !pathGenerator || !projection) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-bg-primary">
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
    <div ref={containerRef} className="relative w-full h-full flex flex-col bg-bg-primary">
      <div
        className="flex-1 relative overflow-hidden min-h-0 transition-transform duration-300 ease-out"
        data-map-container
        style={{
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
          <defs>
            <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="white" floodOpacity="0.6">
                <animate attributeName="floodOpacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
              </feDropShadow>
            </filter>
            <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect
            width={dimensions.width}
            height={dimensions.height}
            fill={isDark ? '#0a0a0a' : '#f5f5f5'}
            className="ocean-background"
            style={{ pointerEvents: 'all', cursor: 'default' }}
            onClick={() => {
              if (interactive && selectedCountry) selectCountry(null);
            }}
          />

          <g ref={gRef} className="map-group">
            <MissingPolygonMarkers
              projection={projection}
              countries={countryMap}
              mode={mapMode}
              isDark={isDark}
              bivariateBreaks={bivariateBreaks}
              selectedId={selectedCountry}
              hoveredId={hoveredCountry}
              onHover={(id) => {
                if (!interactive || isDragging) return;
                hoverCountry(id);
              }}
              onClick={(id) => {
                if (!interactive || isDragging) return;
                selectCountry(id);
              }}
            />
            {features.map((feature) => {
              const featureId = String(feature.id);
              const alpha3 = getAlpha3Code(featureId);
              const country = countryMap.get(alpha3);
              const isHovered = hoveredCountry === alpha3 && !isDragging;
              const isSelected = selectedCountry === alpha3;
              const passFilter = passesFilter(alpha3);

              const fillColor = getCountryColor(country, mapMode, isDark, bivariateBreaks);
              const opacity = country ? (passFilter ? 1 : 0.12) : 1;

              const pathD = pathGenerator(feature);
              if (!pathD) return null;

              return (
                <path
                  key={featureId}
                  data-country={alpha3}
                  className={`country-path ${isSelected ? 'country-selected' : ''}`}
                  d={pathD}
                  fill={fillColor}
                  fillOpacity={opacity}
                  stroke={isSelected ? selectedStrokeColor : isHovered ? hoverStrokeColor : strokeColor}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 0.5}
                  filter={isSelected ? 'url(#selectedGlow)' : undefined}
                  style={{ cursor: interactive && country && !isDragging ? 'pointer' : 'inherit' }}
                  onMouseMove={(e) => handleCountryMouseMove(e, featureId)}
                  onMouseLeave={handleCountryMouseLeave}
                  onClick={(e) => handleCountryClick(e, featureId)}
                />
              );
            })}
          </g>
        </svg>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
              : 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)',
          }}
        />

        {!hasFilteredResults && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm z-10">
            <div className="text-center p-6 rounded-xl bg-bg-secondary border border-border-subtle shadow-lg">
              <p className="text-text-secondary mb-3">No countries match current filters</p>
              <button
                onClick={() => useAtlasStore.getState().setClusterFilter(null)}
                className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Reset filters
              </button>
            </div>
          </div>
        )}

        {interactive && (
          <motion.div
            className="absolute bottom-24 right-6 z-20 p-1.5 rounded-xl bg-bg-secondary/80 backdrop-blur-xl border border-border-subtle shadow-xl flex flex-col gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={handleZoomIn}
              disabled={currentZoom >= MAX_ZOOM}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
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
              className="w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
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
              className="w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Reset view"
              title="Reset view"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {interactive && currentZoom > 1 && (
          <div className="absolute bottom-5 left-5 px-2.5 py-1 rounded-lg bg-bg-secondary/90 backdrop-blur-sm text-xs font-mono text-text-secondary border border-border-subtle z-20">
            {currentZoom.toFixed(1)}×
          </div>
        )}

        {interactive && !isDragging && (
          <MapTooltip
            country={hoveredCountryData ?? null}
            mapMode={mapMode}
            mousePosition={mousePosition}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
          />
        )}
      </div>

      <div className="shrink-0 py-3 px-4 flex justify-center bg-bg-primary">
        <MapLegend mapMode={mapMode} />
      </div>
    </div>
  );
};
