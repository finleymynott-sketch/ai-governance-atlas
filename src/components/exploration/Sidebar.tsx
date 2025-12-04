import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { PillarSelector } from './PillarSelector';
import { ClusterFilter } from './ClusterFilter';
import { CountrySearch } from './CountrySearch';
import { Tooltip } from '@/components/ui/Tooltip';

const SIDEBAR_WIDTH = 280;

/**
 * Collapsible sidebar with map controls
 * Search dropdown floats above other content via z-index
 */
export const Sidebar = () => {
  const sidebarOpen = useAtlasStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAtlasStore((state) => state.setSidebarOpen);

  return (
    <>
      {/* Sidebar panel - Premium styling */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: SIDEBAR_WIDTH, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="
              relative h-full shrink-0
              bg-gradient-to-b from-bg-secondary to-bg-primary
              border-r border-border-subtle
              shadow-2xl shadow-black/20
              sidebar-container
            "
            style={{ overflow: 'visible' }}
          >
            {/* Inner highlight at top */}
            <div className="inner-highlight" />
            
            <div
              className="h-full flex flex-col"
              style={{ width: SIDEBAR_WIDTH }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-subtle/50 shrink-0">
                <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                  Controls
                </h2>
                <Tooltip content="Collapse sidebar" position="right">
                  <motion.button
                    onClick={() => setSidebarOpen(false)}
                    className="
                      w-8 h-8 rounded-lg
                      flex items-center justify-center
                      text-text-secondary hover:text-text-primary
                      hover:bg-bg-tertiary
                      transition-all duration-200
                    "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Collapse sidebar"
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </Tooltip>
              </div>

              {/* Controls - scrollable area with section cards */}
              <div className="flex-1 overflow-y-auto overflow-x-visible no-scrollbar py-2">
                {/* Country search section */}
                <div className="sidebar-section relative z-50">
                  <CountrySearch />
                </div>
                
                {/* Pillar selector section */}
                <div className="sidebar-section">
                  <PillarSelector />
                </div>
                
                {/* Cluster filter section */}
                <div className="sidebar-section">
                  <ClusterFilter />
                </div>
              </div>

              {/* Footer info - subtle gradient */}
              <div className="p-4 border-t border-border-subtle/30 shrink-0 bg-gradient-to-t from-bg-tertiary/50 to-transparent">
                <div className="text-[11px] text-text-tertiary leading-relaxed">
                  <p className="mb-1 opacity-70">
                    Hover over countries to see details
                  </p>
                  <p className="opacity-70">
                    Click to open full country profile
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button when collapsed */}
      <AnimatePresence>
        {!sidebarOpen && (
          <Tooltip content="Expand sidebar" position="right">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(true)}
              className="
                absolute top-4 left-4 z-30
                w-10 h-10 rounded-lg
                bg-bg-secondary border border-border-subtle
                flex items-center justify-center
                text-text-secondary hover:text-text-primary
                hover:border-border-strong hover:scale-105
                shadow-sm
                transition-all duration-200
              "
              whileTap={{ scale: 0.95 }}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </Tooltip>
        )}
      </AnimatePresence>
    </>
  );
};
