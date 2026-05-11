import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { MapMode } from '@/types';
import { CLUSTER_DEFINITIONS, MAP_MODE_CONFIG } from '@/types';
import { gradientForMode } from '@/utils/pillarScales';
import { BIVARIATE_PALETTE } from '@/utils/scales';
import { useAtlasStore } from '@/store/useAtlasStore';

interface MapLegendProps {
  mapMode: MapMode;
  className?: string;
}

export const MapLegend = ({ mapMode, className = '' }: MapLegendProps) => {
  const theme = useAtlasStore((state) => state.theme);
  const isDark = theme === 'dark';
  const config = MAP_MODE_CONFIG[mapMode];
  const isCategorical = mapMode === 'clusters';
  const isBivariate = mapMode === 'bivariate';
  const isContinuous = !isCategorical && !isBivariate;

  const [fillWidth, setFillWidth] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(false);
    setFillWidth(0);
    const timeout = setTimeout(() => {
      setIsAnimating(true);
      setFillWidth(100);
    }, 50);
    return () => clearTimeout(timeout);
  }, [mapMode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`
        inline-flex flex-col items-center gap-3
        px-6 py-4 rounded-2xl
        bg-bg-secondary/90 backdrop-blur-xl
        border border-border-subtle
        floating-card
        ${className}
      `}
    >
      <div className="flex items-center justify-center gap-2.5">
        <motion.div
          key={mapMode}
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: config.color,
            boxShadow: `0 0 10px ${config.color}`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          key={`label-${mapMode}`}
          className="text-sm font-semibold text-text-primary tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {config.label}
        </motion.span>
      </div>

      {isContinuous && (
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <div
              className="relative h-3 w-64 rounded-full overflow-hidden bg-black/30"
              style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fillWidth}%`,
                  background: gradientForMode(mapMode, isDark),
                  boxShadow: `inset 0 1px 2px rgba(255,255,255,0.2), 0 0 10px ${config.color}30`,
                  transition: isAnimating ? 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                }}
              />
            </div>

            <div className="absolute inset-x-0 -bottom-1.5">
              {[0, 25, 50, 75, 100].map((pos) => (
                <div
                  key={pos}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-px h-1.5" style={{ backgroundColor: 'var(--text-tertiary)' }} />
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-64 mt-2 h-4">
            <div className="absolute inset-0 flex justify-between text-[11px] text-text-tertiary data-value">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>
      )}

      {isCategorical && (
        <div className="grid grid-cols-1 gap-1.5 text-[11px]">
          {CLUSTER_DEFINITIONS.map((cluster) => (
            <div key={cluster.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: cluster.color }}
              />
              <span className="text-text-secondary">
                {cluster.id}: {cluster.label}{' '}
                <span className="text-text-tertiary">({cluster.memberCount})</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {isBivariate && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
            Build × Break (displacement)
          </span>
          <div className="flex flex-col-reverse">
            {BIVARIATE_PALETTE.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => (
                  <span
                    key={`${rowIdx}-${colIdx}`}
                    className="w-6 h-6"
                    style={{ backgroundColor: cell }}
                    title={`Build tier ${rowIdx + 1}, Break tier ${colIdx + 1}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between w-full text-[10px] text-text-tertiary mt-1">
            <span>↑ Build</span>
            <span>Break →</span>
          </div>
        </div>
      )}

      <p className="text-xs text-text-secondary text-center leading-relaxed max-w-[260px]">
        {config.description}
      </p>
    </motion.div>
  );
};
