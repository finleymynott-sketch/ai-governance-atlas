import { motion, AnimatePresence } from 'framer-motion';
import { useAtlasStore } from '@/store/useAtlasStore';
import { CompareEmptyState } from './CompareEmptyState';
import { CompareCards } from './CompareCards';
import { CompareMap } from './CompareMap';
import { CompareSelectedList } from './CompareSelectedList';

/**
 * Main Compare mode section
 * Allows users to select 2-4 countries and compare them side-by-side
 */
export const CompareSection = () => {
  const comparisonCountries = useAtlasStore((state) => state.comparisonCountries);
  const clearComparison = useAtlasStore((state) => state.clearComparison);
  const hasCountries = comparisonCountries.length > 0;

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
      {/* Map area */}
      <div className="flex-1 relative">
        <CompareMap />
        
        {/* Comparison cards overlay */}
        <AnimatePresence>
          {hasCountries && (
            <motion.div
              className="absolute bottom-6 left-0 right-0 flex justify-center px-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <CompareCards />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        <AnimatePresence>
          {!hasCountries && (
            <CompareEmptyState />
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar with instructions/controls */}
      <motion.div 
        className="w-[280px] bg-bg-secondary border-l border-border-subtle p-5 flex flex-col"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          Compare Countries
        </h2>
        
        <p className="text-sm text-text-secondary mb-5 leading-relaxed">
          Click on countries to add them to comparison. Select 2-4 countries to see them side by side.
        </p>

        {/* Selected countries list */}
        <div className="flex-1 min-h-0">
          <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">
            Selected ({comparisonCountries.length}/4)
          </p>
          
          {comparisonCountries.length === 0 ? (
            <p className="text-sm text-text-tertiary italic">
              No countries selected
            </p>
          ) : (
            <CompareSelectedList />
          )}
        </div>

        {/* Clear button */}
        <AnimatePresence>
          {hasCountries && (
            <motion.button
              className="
                w-full py-2.5 px-4 mt-4
                rounded-lg border border-border-subtle
                text-sm text-text-secondary
                hover:text-text-primary hover:bg-bg-primary
                transition-colors
              "
              onClick={clearComparison}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear All
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};


