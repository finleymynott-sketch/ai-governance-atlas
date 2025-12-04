import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleQuantize } from 'd3-scale';
import { geoNaturalEarth1, geoPath, geoCentroid } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { Country, ActivePillar } from '@/types';
import { PILLAR_CONFIG, CLUSTER_DEFINITIONS } from '@/types';
import { ISO_NUMERIC_TO_ALPHA3 } from '@/types/geo';
import { PILLAR_SCALES_DARK, RISK_SCALE } from '@/utils/pillarScales';
import type { ScrollyMapState } from './scrollyConfig';

interface ScrollyMapProps {
  mapState: ScrollyMapState;
}

interface CountryFeature extends Feature<Geometry> {
  id: string;
}

/**
 * Get colour for a country based on its score and active pillar
 */
const getCountryColor = (
  country: Country | undefined,
  pillar: ActivePillar | null,
  isDark: boolean,
  isHighlighted: boolean,
  hasHighlightedCountries: boolean
): string => {
  // If there are highlighted countries and this one isn't, dim it significantly
  if (hasHighlightedCountries && !isHighlighted) {
    return isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(180, 180, 180, 0.3)';
  }

  // Highlighted country gets a warm golden fill
  if (isHighlighted) {
    return isDark ? 'rgba(255, 200, 100, 0.5)' : 'rgba(255, 180, 60, 0.6)';
  }

  if (!country || !pillar) {
    return isDark ? '#2A2A2A' : '#D4D4D4';
  }

  const value = pillar === 'risk' ? country.riskImbalance : country[pillar].overall;

  if (pillar === 'risk') {
    const normalized = (Math.max(-0.5, Math.min(0.5, value)) + 0.5) / 1;
    const scale = scaleQuantize<string>().domain([0, 1]).range(RISK_SCALE);
    return scale(normalized);
  }

  const scale = scaleQuantize<string>().domain([0, 1]).range([...PILLAR_SCALES_DARK[pillar]]);
  return scale(value);
};

/**
 * Non-interactive map for scrollytelling that responds to map state changes.
 * Renders a simplified version of the choropleth map with smooth, staggered transitions.
 */
export const ScrollyMap = ({ mapState }: ScrollyMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [topoData, setTopoData] = useState<Topology | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [prevPillar, setPrevPillar] = useState<ActivePillar | null>(null);
  const [revealedClusters, setRevealedClusters] = useState<string[]>([]);

  const countries = useAtlasStore((state) => state.countries);
  const theme = useAtlasStore((state) => state.theme);

  const isDark = theme === 'dark';
  const hasHighlightedCountries = mapState.highlightedCountries.length > 0;

  // Track pillar changes for sweep animation
  useEffect(() => {
    if (mapState.activePillar !== prevPillar) {
      setPrevPillar(mapState.activePillar);
    }
  }, [mapState.activePillar, prevPillar]);

  // Cluster reveal animation for patterns step
  useEffect(() => {
    if (!mapState.showClusters) {
      setRevealedClusters([]);
      return;
    }

    const clusterIds = CLUSTER_DEFINITIONS.map((c) => c.id);
    const timeouts: NodeJS.Timeout[] = [];

    clusterIds.forEach((clusterId, index) => {
      timeouts.push(
        setTimeout(() => {
          setRevealedClusters((prev) => [...prev, clusterId]);
        }, 500 + index * 600)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, [mapState.showClusters]);

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
        setDimensions({ width: rect.width, height: rect.height });
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

  const getAlpha3Code = (numericId: string): string => {
    return ISO_NUMERIC_TO_ALPHA3[numericId] ?? numericId;
  };

  // Create projection and path generator
  const { projection, pathGenerator, features } = useMemo(() => {
    if (!topoData || dimensions.width === 0 || dimensions.height === 0) {
      return { projection: null, pathGenerator: null, features: [] };
    }

    const { width, height } = dimensions;
    const padding = 40;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scaleByWidth = availableWidth / 5.5;
    const scaleByHeight = availableHeight / 2.8;
    const scale = Math.min(scaleByWidth, scaleByHeight);

    const proj = geoNaturalEarth1()
      .scale(scale)
      .translate([width / 2, height / 2]);

    const path = geoPath().projection(proj);

    const countriesObj = topoData.objects['countries'] as GeometryCollection;
    const feats = topojson.feature(topoData, countriesObj).features as CountryFeature[];

    return { projection: proj, pathGenerator: path, features: feats };
  }, [topoData, dimensions]);

  // Calculate stagger delay based on feature's longitude (for sweep effect)
  const getStaggerDelay = (feature: CountryFeature): number => {
    try {
      const centroid = geoCentroid(feature);
      // Normalize longitude from [-180, 180] to [0, 1]
      const normalizedLon = (centroid[0] + 180) / 360;
      // Return delay from 0 to 400ms based on longitude
      return normalizedLon * 0.4;
    } catch {
      return 0.2;
    }
  };

  const strokeColor = isDark ? '#404040' : '#BEBEBE';

  // Loading state
  if (!topoData || !pathGenerator || !projection) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-bg-primary">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-pillar-build" />
          <div className="w-2 h-2 rounded-full bg-pillar-break" />
          <div className="w-2 h-2 rounded-full bg-pillar-balance" />
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative bg-bg-primary overflow-hidden">
      {/* SVG filters for glow effect */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="highlight-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#FFD700" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Map SVG */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="block select-none"
      >
        {/* Background */}
        <rect
          width={dimensions.width}
          height={dimensions.height}
          className="fill-bg-primary"
        />

        {/* Non-highlighted countries (rendered first, behind) */}
        <g>
          {features.map((feature) => {
            const featureId = String(feature.id);
            const alpha3 = getAlpha3Code(featureId);
            const country = countryMap.get(alpha3);
            const isHighlighted = mapState.highlightedCountries.includes(alpha3);
            const isClusterRevealed = country && revealedClusters.includes(country.clusterId);

            // Skip highlighted countries - they render in a separate layer
            if (isHighlighted) return null;

            const fillColor = getCountryColor(
              country,
              mapState.activePillar,
              isDark,
              false,
              hasHighlightedCountries
            );
            const pathD = pathGenerator(feature);
            const staggerDelay = getStaggerDelay(feature);

            if (!pathD) return null;

            const clusterDef = country ? CLUSTER_DEFINITIONS.find((c) => c.id === country.clusterId) : null;
            const showClusterGlow = mapState.showClusters && isClusterRevealed && clusterDef;

            return (
              <motion.path
                key={featureId}
                d={pathD}
                fill={fillColor}
                stroke={showClusterGlow ? clusterDef.color : strokeColor}
                strokeWidth={showClusterGlow ? 1.5 : 0.3}
                initial={false}
                animate={{
                  fill: fillColor,
                  opacity: hasHighlightedCountries ? 0.4 : 1,
                }}
                transition={{
                  duration: 0.6,
                  delay: staggerDelay,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            );
          })}
        </g>

        {/* Highlighted countries (rendered on top with glow) */}
        <g>
          {features.map((feature) => {
            const featureId = String(feature.id);
            const alpha3 = getAlpha3Code(featureId);
            const isHighlighted = mapState.highlightedCountries.includes(alpha3);

            if (!isHighlighted) return null;

            const fillColor = getCountryColor(
              countryMap.get(alpha3),
              mapState.activePillar,
              isDark,
              true,
              hasHighlightedCountries
            );
            const pathD = pathGenerator(feature);

            if (!pathD) return null;

            return (
              <motion.path
                key={`highlight-${featureId}`}
                d={pathD}
                fill={fillColor}
                stroke="#FFD700"
                strokeWidth={2.5}
                filter="url(#highlight-glow)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  strokeWidth: [2.5, 3.5, 2.5],
                }}
                transition={{
                  opacity: { duration: 0.5 },
                  strokeWidth: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                style={{
                  filter: 'url(#highlight-glow)',
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Pillar indicator badge */}
      <AnimatePresence mode="wait">
        {mapState.activePillar && (
          <motion.div
            key={mapState.activePillar}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary/90 backdrop-blur-sm border border-border-subtle shadow-lg"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: PILLAR_CONFIG[mapState.activePillar].color }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-text-primary">
              {PILLAR_CONFIG[mapState.activePillar].label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cluster legend with staggered reveal */}
      <AnimatePresence>
        {mapState.showClusters && (
          <motion.div
            className="absolute bottom-6 right-6 p-4 rounded-xl bg-bg-secondary/90 backdrop-blur-sm border border-border-subtle shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Country Archetypes
            </h4>
            <div className="space-y-2">
              {CLUSTER_DEFINITIONS.map((cluster, index) => {
                const isRevealed = revealedClusters.includes(cluster.id);
                return (
                  <motion.div
                    key={cluster.id}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: isRevealed ? 1 : 0.3,
                      x: isRevealed ? 0 : -10,
                    }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                      animate={isRevealed ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="text-sm text-text-secondary">{cluster.shortName}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
