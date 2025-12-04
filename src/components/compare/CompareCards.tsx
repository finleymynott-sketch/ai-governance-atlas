import { motion, AnimatePresence } from 'framer-motion';
import { useAtlasStore } from '@/store/useAtlasStore';
import { CompareCard } from './CompareCard';
import type { Country } from '@/types';

/**
 * Container for comparison cards shown at bottom of map
 */
export const CompareCards = () => {
  const comparisonCountries = useAtlasStore((state) => state.comparisonCountries);
  const countries = useAtlasStore((state) => state.countries);

  const selectedCountryData = comparisonCountries
    .map(id => countries.find(c => c.id === id))
    .filter((c): c is Country => c !== undefined);

  return (
    <div className="
      flex items-stretch gap-3 
      p-4 
      bg-bg-secondary/90 backdrop-blur-xl 
      rounded-2xl 
      border border-border-subtle 
      shadow-2xl
    ">
      <AnimatePresence mode="popLayout">
        {selectedCountryData.map((country, index) => (
          <motion.div
            key={country.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              delay: index * 0.05 
            }}
          >
            <CompareCard country={country} index={index} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add more prompt if less than 4 */}
      {comparisonCountries.length < 4 && comparisonCountries.length > 0 && (
        <motion.div
          className="
            w-[180px] 
            flex items-center justify-center 
            border-2 border-dashed border-border-subtle 
            rounded-xl 
            text-text-tertiary
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm">+ Add country</span>
        </motion.div>
      )}
    </div>
  );
};


