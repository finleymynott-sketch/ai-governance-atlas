import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Country, MapMode } from '@/types';
import { CLUSTER_DEFINITIONS, MAP_MODE_CONFIG } from '@/types';
import { valueForMode } from '@/utils/dataLoader';

interface MapTooltipProps {
  country: Country | null;
  mapMode: MapMode;
  mousePosition: { x: number; y: number } | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const MapTooltip = ({ country, mapMode, mousePosition, containerRef }: MapTooltipProps) => {
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
    if (x + tooltipRect.width > containerRect.width - padding) {
      x = mousePosition.x - tooltipRect.width - offsetX;
    }
    if (y + tooltipRect.height > containerRect.height - padding) {
      y = mousePosition.y - tooltipRect.height - offsetY;
    }
    if (x < padding) x = padding;
    if (y < padding) y = padding;
    setAdjustedPosition({ x, y });
  }, [mousePosition, containerRef]);

  const config = MAP_MODE_CONFIG[mapMode];
  const cluster = country ? CLUSTER_DEFINITIONS.find((c) => c.id === country.cluster.id) : null;
  // In clusters mode the cluster identity is the value; the second cluster
  // badge below would duplicate it, so we hide the value line entirely.
  const showValueLine = mapMode !== 'clusters';

  const formatTooltipValue = (c: Country): string => {
    if (mapMode === 'bivariate') {
      return `Build ${(c.build.hazard * 100).toFixed(0)} · Break ${(c.break.displacement * 100).toFixed(0)}`;
    }
    if (mapMode === 'risk') {
      return `${(c.risk.total * 100).toFixed(1)} · rank ${c.risk.rank}`;
    }
    if (mapMode === 'sovereignty') {
      return c.balance.sovereignty.toFixed(2);
    }
    const value = valueForMode(c, mapMode as Exclude<MapMode, 'bivariate' | 'clusters'>);
    return (value * 100).toFixed(0);
  };

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
          style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        >
          <div
            className="
              px-3 py-2.5 rounded-lg
              bg-bg-elevated text-text-primary
              shadow-xl border border-border-subtle
              min-w-[200px]
              backdrop-blur-sm
            "
          >
            <div className="font-semibold text-sm mb-1.5">{country.name}</div>

            {showValueLine && (
              <div className="flex items-center gap-2 mb-1.5">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                  animate={{ boxShadow: `0 0 6px ${config.color}50` }}
                />
                <span className="text-text-secondary text-xs">{config.shortLabel}:</span>
                <span className="text-sm font-bold tabular-nums">{formatTooltipValue(country)}</span>
              </div>
            )}

            {cluster && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cluster.color }} />
                <span className="text-text-tertiary text-xs">
                  {cluster.label}
                  {country.cluster.unstable && ' (unstable membership)'}
                </span>
              </div>
            )}

            {country.flags.kafalaCaveat && (
              <div className="mt-2 pt-2 border-t border-border-subtle text-[10px] text-text-tertiary">
                ⚠ Kafala caveat — see country panel
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
