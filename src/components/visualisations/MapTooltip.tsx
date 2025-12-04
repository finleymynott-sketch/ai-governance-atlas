import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Country, ActivePillar } from '@/types';
import { PILLAR_CONFIG, CLUSTER_DEFINITIONS } from '@/types';

interface MapTooltipProps {
  country: Country | null;
  activePillar: ActivePillar;
  mousePosition: { x: number; y: number } | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Floating tooltip that follows the cursor and displays country information
 */
export const MapTooltip = ({
  country,
  activePillar,
  mousePosition,
  containerRef,
}: MapTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!mousePosition || !tooltipRef.current || !containerRef.current) return;

    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const offsetX = 16;
    const offsetY = 16;
    const padding = 8;

    let x = mousePosition.x + offsetX;
    let y = mousePosition.y + offsetY;

    // Prevent tooltip from going off right edge
    if (x + tooltipRect.width > containerRect.width - padding) {
      x = mousePosition.x - tooltipRect.width - offsetX;
    }

    // Prevent tooltip from going off bottom edge
    if (y + tooltipRect.height > containerRect.height - padding) {
      y = mousePosition.y - tooltipRect.height - offsetY;
    }

    // Prevent tooltip from going off left edge
    if (x < padding) {
      x = padding;
    }

    // Prevent tooltip from going off top edge
    if (y < padding) {
      y = padding;
    }

    setAdjustedPosition({ x, y });
  }, [mousePosition, containerRef]);

  const getScore = (c: Country): number => {
    if (activePillar === 'risk') {
      return c.riskImbalance;
    }
    return c[activePillar].overall;
  };

  const formatScore = (score: number, pillar: ActivePillar): string => {
    if (pillar === 'risk') {
      const prefix = score > 0 ? '+' : '';
      return `${prefix}${(score * 100).toFixed(0)}`;
    }
    return (score * 100).toFixed(0);
  };

  const cluster = country
    ? CLUSTER_DEFINITIONS.find((c) => c.id === country.clusterId)
    : null;

  const pillarConfig = PILLAR_CONFIG[activePillar];

  return (
    <AnimatePresence>
      {country && mousePosition && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 5 }}
          transition={{ duration: 0.1, ease: [0, 0, 0.2, 1] }}
          className="absolute z-50 pointer-events-none"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
          }}
        >
          <div
            className="
              px-3 py-2.5 rounded-lg
              bg-bg-elevated text-text-primary
              shadow-xl border border-border-subtle
              min-w-[180px]
              backdrop-blur-sm
            "
          >
            {/* Country name */}
            <div className="font-semibold text-sm mb-1.5">{country.name}</div>

            {/* Pillar score */}
            <div className="flex items-center gap-2 mb-1.5">
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: pillarConfig.color }}
                animate={{ boxShadow: `0 0 6px ${pillarConfig.color}50` }}
              />
              <span className="text-text-secondary text-xs">
                {pillarConfig.label}:
              </span>
              <span className="text-sm font-bold tabular-nums">
                {formatScore(getScore(country), activePillar)}
                {activePillar !== 'risk' && '%'}
              </span>
            </div>

            {/* Cluster badge */}
            {cluster && (
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cluster.color }}
                />
                <span className="text-text-tertiary text-xs">
                  {cluster.shortName}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

