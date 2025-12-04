import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ChoroplethMap } from '@/components/visualisations';
import { CountryPanel } from '@/components/country/CountryPanel';

/**
 * Main exploration view layout with sidebar, map, and country panel
 * CountryPanel is fixed positioned and floats over the map without affecting layout
 */
export const ExplorationSection = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-[calc(100vh-3.5rem)] flex overflow-hidden"
      >
        {/* Left sidebar */}
        <Sidebar />

        {/* Main map area - takes full remaining width */}
        <div className="flex-1 relative overflow-hidden bg-bg-primary" data-map-container>
          <ChoroplethMap interactive />
        </div>
      </motion.div>

      {/* Country panel - fixed positioned overlay, outside flex layout */}
      <CountryPanel />
    </>
  );
};
