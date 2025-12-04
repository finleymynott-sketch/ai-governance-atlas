import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '@/components/layout';
import { ExplorationSection } from '@/components/exploration';
import { ScrollytellingSection } from '@/components/scrollytelling';
import { CompareSection } from '@/components/compare';
import { MethodologySection } from '@/components/methodology';
import { useAtlasStore } from '@/store/useAtlasStore';

/**
 * Root application component
 */
function App() {
  const viewMode = useAtlasStore((state) => state.viewMode);
  const setViewMode = useAtlasStore((state) => state.setViewMode);

  const handleScrollyComplete = useCallback(() => {
    setViewMode('exploration');
  }, [setViewMode]);

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        {viewMode === 'exploration' && (
          <motion.div
            key="exploration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ExplorationSection />
          </motion.div>
        )}

        {viewMode === 'scrollytelling' && (
          <motion.div
            key="scrollytelling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ScrollytellingSection onComplete={handleScrollyComplete} />
          </motion.div>
        )}

        {viewMode === 'comparison' && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CompareSection />
          </motion.div>
        )}

        {viewMode === 'methodology' && (
          <motion.div
            key="methodology"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MethodologySection />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle noise texture overlay for premium feel */}
      <div className="noise-overlay" aria-hidden="true" />
    </AppShell>
  );
}

export default App;
