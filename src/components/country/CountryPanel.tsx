import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, GitCompare, ExternalLink } from 'lucide-react';
import { useAtlasStore, useSelectedCountry } from '@/store/useAtlasStore';
import { PILLAR_CONFIG, CLUSTER_DEFINITIONS } from '@/types';
import { getFlagEmoji } from '@/utils/flags';
import { getSourceUrl } from '@/utils/sources';
import type { ActivePillar, Country } from '@/types';

const pillarsToShow: Exclude<ActivePillar, 'risk'>[] = ['build', 'break', 'balance'];

// Animation variants for staggered content
const panelVariants = {
  hidden: { 
    x: '100%',  // Start off-screen to the right
  },
  visible: { 
    x: 0,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
  exit: { 
    x: '100%',  // Slide back off-screen
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0, 0, 0.2, 1],
    }
  },
};

const barVariants = {
  hidden: { width: 0 },
  visible: (value: number) => ({
    width: `${value}%`,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1], // Slight overshoot
      delay: 0.2,
    }
  }),
};

/** Get ordinal suffix for a number */
const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'] as const;
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th');
};

/**
 * Slide-in panel showing detailed country information
 * Includes flags, scores, and rankings
 */
export const CountryPanel = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  
  const countries = useAtlasStore((state) => state.countries);
  const countryPanelOpen = useAtlasStore((state) => state.countryPanelOpen);
  const selectCountry = useAtlasStore((state) => state.selectCountry);
  const comparisonCountries = useAtlasStore((state) => state.comparisonCountries);
  const addToComparison = useAtlasStore((state) => state.addToComparison);
  const removeFromComparison = useAtlasStore((state) => state.removeFromComparison);
  const setViewMode = useAtlasStore((state) => state.setViewMode);
  const country = useSelectedCountry();
  
  // Comparison state
  const isInComparison = country ? comparisonCountries.includes(country.id) : false;
  const canAddToComparison = comparisonCountries.length < 4;

  const cluster = country
    ? CLUSTER_DEFINITIONS.find((c) => c.id === country.clusterId)
    : null;

  // Calculate rankings
  const rankings = useMemo(() => {
    if (!country || countries.length === 0) return null;

    const getRank = (sortFn: (a: Country, b: Country) => number): number => {
      const sorted = [...countries].sort(sortFn);
      return sorted.findIndex((c) => c.id === country.id) + 1;
    };

    const buildRank = getRank((a, b) => b.build.overall - a.build.overall);
    const breakRank = getRank((a, b) => b.break.overall - a.break.overall);
    const balanceRank = getRank((a, b) => b.balance.overall - a.balance.overall);
    
    // Risk ranking - sort by absolute value of imbalance
    const riskSorted = [...countries].sort((a, b) => b.riskImbalance - a.riskImbalance);
    const riskRank = riskSorted.findIndex((c) => c.id === country.id) + 1;
    const isDeficit = country.riskImbalance > 0;

    return {
      build: buildRank,
      break: breakRank,
      balance: balanceRank,
      risk: riskRank,
      isDeficit,
      total: countries.length,
    };
  }, [country, countries]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && countryPanelOpen) {
        selectCountry(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [countryPanelOpen, selectCountry]);

  const flagEmoji = country ? getFlagEmoji(country.id) : '';

  return (
    <AnimatePresence mode="wait">
      {countryPanelOpen && country && (
        <motion.aside
          ref={panelRef}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="
            fixed right-0 top-14 bottom-0
            w-[400px] z-40
            bg-gradient-to-b from-bg-secondary to-bg-primary
            border-l border-border-subtle
            shadow-2xl shadow-black/50
            overflow-hidden
          "
        >
          {/* Inner highlight at top */}
          <div className="inner-highlight" />
          
          <div className="h-full overflow-y-auto no-scrollbar">
            {/* Header - larger flag, better typography */}
            <motion.div 
              variants={itemVariants}
              className="sticky top-0 z-10 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-subtle/50 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 flex items-start gap-4">
                  {/* Flag - larger */}
                  {flagEmoji && (
                    <motion.span 
                      className="text-5xl leading-none" 
                      role="img" 
                      aria-label={`${country.name} flag`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                    >
                      {flagEmoji}
                    </motion.span>
                  )}
                  <div className="min-w-0 pt-1">
                    <h2 className="text-2xl font-bold text-text-primary truncate tracking-tight">
                      {country.name}
                    </h2>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {country.region}
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={() => selectCountry(null)}
                  className="
                    w-9 h-9 rounded-lg shrink-0
                    flex items-center justify-center
                    text-text-tertiary hover:text-text-primary
                    hover:bg-bg-tertiary
                    transition-colors duration-200
                  "
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Cluster badge with glow */}
              {cluster && (
                <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <span
                    className="
                      inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                      text-xs font-medium
                    "
                    style={{
                      backgroundColor: `color-mix(in srgb, ${cluster.color} 15%, transparent)`,
                      color: cluster.color,
                      border: `1px solid color-mix(in srgb, ${cluster.color} 30%, transparent)`,
                      boxShadow: `0 0 20px ${cluster.color}20`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                    />
                    {cluster.shortName}
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Pillar scores - card style */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h3 className="section-label px-1">
                  Pillar Scores
                </h3>

                <div className="space-y-3">
                  {pillarsToShow.map((pillar, index) => {
                    const config = PILLAR_CONFIG[pillar];
                    const score = country[pillar].overall;
                    const percentage = Math.round(score * 100);
                    const rank = rankings?.[pillar];

                    return (
                      <motion.div 
                        key={pillar} 
                        className="p-4 rounded-xl bg-bg-primary/50 border border-border-subtle/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <motion.div
                              className="w-3 h-3 rounded-full"
                              style={{ 
                                backgroundColor: config.color,
                                boxShadow: `0 0 8px ${config.color}50`,
                              }}
                            />
                            <span className="font-medium text-text-primary">
                              {config.label}
                            </span>
                          </div>
                          <span className="text-xl font-bold text-text-primary data-value">
                            {percentage}%
                          </span>
                        </div>

                        {/* Premium progress bar with glow */}
                        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ 
                              backgroundColor: config.color,
                              boxShadow: `0 0 10px ${config.color}50`,
                            }}
                            variants={barVariants}
                            initial="hidden"
                            animate="visible"
                            custom={percentage}
                          />
                        </div>

                        {/* Ranking */}
                        {rank && rankings && (
                          <p className="text-xs text-text-tertiary mt-2">
                            Ranked {getOrdinal(rank)} of {rankings.total} countries
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Risk imbalance */}
              <div className="space-y-2">
                <h3 className="section-header">
                  Risk Imbalance
                </h3>

                <div className="p-3 rounded-lg bg-bg-tertiary border border-border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">
                      Build − Balance Gap
                    </span>
                    <span
                      className="text-sm font-mono font-medium"
                      style={{
                        color:
                          country.riskImbalance > 0.1
                            ? PILLAR_CONFIG.risk.color
                            : country.riskImbalance < -0.1
                            ? PILLAR_CONFIG.balance.color
                            : 'var(--text-secondary)',
                      }}
                    >
                      {country.riskImbalance > 0 ? '+' : ''}
                      {(country.riskImbalance * 100).toFixed(0)}
                    </span>
                  </div>

                  {/* Risk ranking */}
                  {rankings && (
                    <p className="text-xs text-text-tertiary mb-2">
                      {rankings.isDeficit
                        ? `${getOrdinal(rankings.risk)} highest governance gap`
                        : `${getOrdinal(rankings.total - rankings.risk + 1)} strongest governance position`
                      }
                    </p>
                  )}

                  <p className="text-xs text-text-tertiary">
                    {country.riskImbalance > 0.15
                      ? 'High governance deficit: AI capability significantly outpaces regulatory readiness'
                      : country.riskImbalance > 0
                      ? 'Moderate governance deficit: AI capability slightly ahead of regulations'
                      : country.riskImbalance < -0.15
                      ? 'Governance surplus: Strong regulatory framework for current AI capability'
                      : 'Balanced: Governance roughly matches AI capability level'}
                  </p>
                </div>
              </div>

              {/* Indicator breakdown */}
              <div className="space-y-3">
                <h3 className="section-header">
                  Indicator Breakdown
                </h3>

                {pillarsToShow.map((pillar) => {
                  const config = PILLAR_CONFIG[pillar];
                  const indicators = country[pillar].indicators;

                  return (
                    <details key={pillar} className="group">
                      <summary
                        className="
                          flex items-center gap-2 px-3 py-2 rounded-lg
                          bg-bg-tertiary border border-border-subtle
                          cursor-pointer
                          hover:border-border-strong
                          transition-all duration-200
                        "
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-sm font-medium text-text-primary">
                          {config.label} Indicators
                        </span>
                        <span className="ml-auto text-xs text-text-tertiary group-open:rotate-180 transition-transform duration-200">
                          ▼
                        </span>
                      </summary>

                      <div className="mt-2 pl-4 space-y-1">
                        {Object.entries(indicators).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="text-xs text-text-secondary capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-mono text-text-tertiary">
                              {Math.round(value * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                {/* Add/Remove from Compare button */}
                <motion.button
                  onClick={() => {
                    if (isInComparison) {
                      removeFromComparison(country.id);
                    } else if (canAddToComparison) {
                      addToComparison(country.id);
                    }
                  }}
                  disabled={!canAddToComparison && !isInComparison}
                  className={`
                    w-full flex items-center justify-center gap-2
                    h-11 rounded-lg
                    text-sm font-medium
                    transition-all duration-200
                    ${isInComparison 
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25' 
                      : canAddToComparison
                        ? 'bg-accent-primary text-white hover:opacity-90'
                        : 'bg-bg-tertiary border border-border-subtle text-text-tertiary cursor-not-allowed opacity-50'
                    }
                  `}
                  whileHover={canAddToComparison || isInComparison ? { scale: 1.01 } : {}}
                  whileTap={canAddToComparison || isInComparison ? { scale: 0.99 } : {}}
                >
                  {isInComparison ? (
                    <>
                      <Minus className="w-4 h-4" />
                      Remove from Compare
                    </>
                  ) : canAddToComparison ? (
                    <>
                      <Plus className="w-4 h-4" />
                      Add to Compare
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Compare Full (4 max)
                    </>
                  )}
                </motion.button>

                {/* Go to Compare Mode button - shows when countries are in comparison */}
                {comparisonCountries.length >= 2 && (
                  <motion.button
                    onClick={() => {
                      selectCountry(null);
                      setViewMode('comparison');
                    }}
                    className="
                      w-full flex items-center justify-center gap-2
                      h-10 rounded-lg
                      bg-bg-tertiary border border-border-subtle
                      text-text-secondary text-sm font-medium
                      hover:text-text-primary hover:border-border-strong
                      transition-all duration-200
                    "
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <GitCompare className="w-4 h-4" />
                    View Comparison ({comparisonCountries.length})
                  </motion.button>
                )}

                {/* Status text */}
                {comparisonCountries.length > 0 && comparisonCountries.length < 2 && (
                  <p className="text-xs text-text-tertiary text-center">
                    Add {2 - comparisonCountries.length} more to compare
                  </p>
                )}
              </div>

              {/* View Sources link */}
              <div className="pt-4 mt-2 border-t border-border-subtle">
                <a
                  href={getSourceUrl(country.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center justify-center gap-2
                    w-full py-2.5 px-4
                    rounded-lg
                    bg-bg-primary
                    border border-border-subtle
                    text-sm text-text-secondary
                    hover:text-text-primary
                    hover:border-accent-primary
                    transition-colors
                  "
                >
                  <ExternalLink className="w-4 h-4" />
                  View Data Sources
                </a>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
