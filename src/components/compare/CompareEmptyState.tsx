import { motion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';

/**
 * Empty state shown when no countries are selected for comparison
 */
export const CompareEmptyState = () => {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        {/* Animated icon container */}
        <motion.div
          className="
            w-20 h-20 mx-auto mb-5
            rounded-full bg-bg-secondary/80 backdrop-blur-sm
            border border-border-subtle
            flex items-center justify-center
            shadow-lg
          "
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0)',
              '0 0 0 8px rgba(59, 130, 246, 0.1)',
              '0 0 0 0 rgba(59, 130, 246, 0)',
            ]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <MousePointerClick className="w-8 h-8 text-text-tertiary" />
        </motion.div>
        
        <motion.h3 
          className="text-lg font-semibold text-text-primary mb-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Select Countries to Compare
        </motion.h3>
        
        <motion.p 
          className="text-sm text-text-secondary max-w-xs leading-relaxed"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Click on 2-4 countries on the map to see their Build, Break, and Balance scores compared side by side
        </motion.p>
      </div>
    </motion.div>
  );
};


