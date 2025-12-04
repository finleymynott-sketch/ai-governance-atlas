import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { getFlagEmoji } from '@/utils/flags';
import { COMPARE_COLORS } from './CompareCard';
import type { Country } from '@/types';

/**
 * Sidebar list of selected countries for comparison
 */
export const CompareSelectedList = () => {
  const comparisonCountries = useAtlasStore((state) => state.comparisonCountries);
  const countries = useAtlasStore((state) => state.countries);
  const removeFromComparison = useAtlasStore((state) => state.removeFromComparison);

  const selectedCountryData = comparisonCountries
    .map(id => countries.find(c => c.id === id))
    .filter((c): c is Country => c !== undefined);

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {selectedCountryData.map((country, index) => (
          <motion.div
            key={country.id}
            className="
              flex items-center justify-between 
              p-2.5 
              rounded-lg bg-bg-primary
              border border-transparent
              hover:border-border-subtle
              transition-colors
            "
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center gap-2.5">
              {/* Number badge */}
              <div 
                className="
                  w-5 h-5 rounded-full 
                  flex items-center justify-center
                  text-white text-[10px] font-bold
                "
                style={{ backgroundColor: COMPARE_COLORS[index] }}
              >
                {index + 1}
              </div>
              
              {/* Flag */}
              <span className="text-lg">{getFlagEmoji(country.id)}</span>
              
              {/* Name */}
              <span className="text-sm text-text-primary truncate max-w-[120px]">
                {country.name}
              </span>
            </div>
            
            {/* Remove button */}
            <motion.button
              className="
                p-1 rounded 
                hover:bg-bg-secondary 
                transition-colors
              "
              onClick={() => removeFromComparison(country.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Remove ${country.name}`}
            >
              <X className="w-3.5 h-3.5 text-text-tertiary" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};


