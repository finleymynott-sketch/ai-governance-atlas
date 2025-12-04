import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { getFlagEmoji } from '@/utils/flags';
import { PILLAR_COLORS } from '@/utils/pillarScales';
import type { Country, Cluster } from '@/types';

/** Colors used for numbered badges on map */
export const COMPARE_COLORS = [
  '#3B82F6',  // Blue
  '#10B981',  // Green  
  '#F59E0B',  // Amber
  '#EF4444',  // Red
];

interface CompareCardProps {
  country: Country;
  index: number;
}

/**
 * Individual country comparison card showing pillar scores
 */
export const CompareCard = ({ country, index }: CompareCardProps) => {
  const removeFromComparison = useAtlasStore((state) => state.removeFromComparison);
  const clusters = useAtlasStore((state) => state.clusters);
  
  const cluster = clusters.find((c: Cluster) => c.id === country.clusterId);

  const pillars = [
    { name: 'Build', value: Math.round(country.build.overall * 100), color: PILLAR_COLORS.build },
    { name: 'Break', value: Math.round(country.break.overall * 100), color: PILLAR_COLORS.break },
    { name: 'Balance', value: Math.round(country.balance.overall * 100), color: PILLAR_COLORS.balance },
  ];

  return (
    <div className="w-[180px] bg-bg-primary rounded-xl p-4 relative">
      {/* Remove button */}
      <motion.button
        className="
          absolute top-2 right-2 p-1.5 
          rounded-md 
          hover:bg-bg-secondary 
          transition-colors
        "
        onClick={() => removeFromComparison(country.id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Remove ${country.name} from comparison`}
      >
        <X className="w-3.5 h-3.5 text-text-tertiary" />
      </motion.button>

      {/* Number badge - matches map badge */}
      <div 
        className="
          absolute -top-2 -left-2 
          w-6 h-6 rounded-full 
          flex items-center justify-center
          text-white text-xs font-bold
          shadow-lg
        "
        style={{ backgroundColor: COMPARE_COLORS[index] }}
      >
        {index + 1}
      </div>

      {/* Header */}
      <div className="text-center mb-4 pt-1">
        <span className="text-3xl">{getFlagEmoji(country.id)}</span>
        <h3 className="text-sm font-semibold text-text-primary mt-1.5 truncate">
          {country.name}
        </h3>
      </div>

      {/* Pillar bars */}
      <div className="space-y-3">
        {pillars.map((pillar, pillarIndex) => (
          <div key={pillar.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-secondary">
                {pillar.name}
              </span>
              <span className="text-xs font-semibold text-text-primary tabular-nums">
                {pillar.value}%
              </span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: pillar.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pillar.value}%` }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.15 + pillarIndex * 0.1,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Risk imbalance */}
      <div className="mt-3 pt-3 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Risk Gap</span>
          <span 
            className="text-xs font-semibold tabular-nums"
            style={{ 
              color: country.riskImbalance > 0.1 
                ? PILLAR_COLORS.break 
                : country.riskImbalance < -0.1 
                  ? PILLAR_COLORS.balance 
                  : 'var(--text-secondary)' 
            }}
          >
            {country.riskImbalance > 0 ? '+' : ''}{(country.riskImbalance * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Cluster badge */}
      {cluster && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <span 
            className="text-[10px] uppercase tracking-wider"
            style={{ color: cluster.color }}
          >
            {cluster.shortName}
          </span>
        </div>
      )}
    </div>
  );
};


