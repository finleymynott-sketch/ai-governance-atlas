import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtlasStore } from '@/store/useAtlasStore';
import { CLUSTER_DEFINITIONS } from '@/types';

/**
 * Animated custom checkbox with checkmark that draws itself
 */
const AnimatedCheckbox = ({ 
  checked, 
  color 
}: { 
  checked: boolean; 
  color: string;
}) => (
  <div 
    className="relative w-5 h-5 rounded border-2 transition-colors duration-200 flex-shrink-0"
    style={{
      borderColor: checked ? color : 'var(--border-subtle)',
      backgroundColor: checked ? color : 'transparent',
    }}
  >
    <AnimatePresence>
      {checked && (
        <motion.svg
          className="absolute inset-0 w-full h-full p-0.5"
          viewBox="0 0 24 24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  </div>
);

/**
 * Filter countries by cluster with premium checkboxes
 * Shows count of countries in each cluster
 */
export const ClusterFilter = () => {
  const countries = useAtlasStore((state) => state.countries);
  const activeClusterFilter = useAtlasStore((state) => state.activeClusterFilter);
  const setClusterFilter = useAtlasStore((state) => state.setClusterFilter);

  // Calculate cluster counts
  const clusterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    countries.forEach((country) => {
      counts[country.clusterId] = (counts[country.clusterId] ?? 0) + 1;
    });
    return counts;
  }, [countries]);

  const totalCount = countries.length;

  return (
    <div className="space-y-3">
      <h3 className="section-header">
        Filter by Cluster
      </h3>

      <div className="space-y-1">
        {/* Show all option */}
        <motion.button
          onClick={() => setClusterFilter(null)}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg
            text-left cursor-pointer
            transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
            ${!activeClusterFilter 
              ? 'bg-bg-tertiary text-text-primary' 
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
            }
          `}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatedCheckbox 
            checked={!activeClusterFilter} 
            color="var(--accent-primary)" 
          />

          <span className={`
            text-sm font-medium flex-1 transition-colors duration-200
            ${!activeClusterFilter ? 'text-text-primary' : 'text-text-secondary'}
          `}>
            Show all countries
          </span>
          <span className="text-xs text-text-tertiary tabular-nums">({totalCount})</span>
        </motion.button>

        {/* Cluster options */}
        {CLUSTER_DEFINITIONS.map((cluster) => {
          const isActive = activeClusterFilter === cluster.id;
          const count = clusterCounts[cluster.id] ?? 0;

          return (
            <motion.button
              key={cluster.id}
              onClick={() => setClusterFilter(isActive ? null : cluster.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg
                text-left cursor-pointer
                transition-colors duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                hover:bg-bg-tertiary/50
                ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}
              `}
              whileTap={{ scale: 0.98 }}
            >
              {/* Cluster colour dot with glow */}
              <motion.div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cluster.color }}
                animate={{
                  scale: isActive ? 1.3 : 1,
                  boxShadow: isActive ? `0 0 10px ${cluster.color}` : '0 0 0px transparent',
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Label */}
              <span className={`
                text-sm flex-1 truncate transition-colors duration-200
                ${isActive ? 'text-text-primary font-medium' : 'text-text-secondary'}
              `}>
                {cluster.shortName}
              </span>

              {/* Count badge */}
              <span className="text-xs text-text-tertiary tabular-nums">({count})</span>

              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: cluster.color }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
