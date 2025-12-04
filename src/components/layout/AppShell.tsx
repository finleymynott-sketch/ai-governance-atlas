import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { useAtlasStore } from '@/store/useAtlasStore';
import { useTheme } from '@/hooks/useTheme';

interface AppShellProps {
  children?: React.ReactNode;
}

/**
 * Main application shell providing consistent layout structure
 * Handles theme initialization and basic responsive layout
 */
export const AppShell = ({ children }: AppShellProps) => {
  const viewMode = useAtlasStore((state) => state.viewMode);
  const loadData = useAtlasStore((state) => state.loadData);
  const isLoading = useAtlasStore((state) => state.isLoading);
  const error = useAtlasStore((state) => state.error);
  
  // Initialize theme
  useTheme();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Header />
      
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <LoadingState />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ErrorState message={error} />
            </motion.div>
          ) : children ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <PlaceholderContent viewMode={viewMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/**
 * Loading state component
 */
const LoadingState = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="flex items-center gap-2">
      <motion.div
        className="w-3 h-3 rounded-full bg-pillar-build"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-3 h-3 rounded-full bg-pillar-break"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
      />
      <motion.div
        className="w-3 h-3 rounded-full bg-pillar-balance"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
      />
    </div>
    <p className="text-text-secondary text-sm">Loading atlas data...</p>
  </div>
);

/**
 * Error state component
 */
const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center gap-4 p-8 max-w-md text-center">
    <div className="w-12 h-12 rounded-full bg-pillar-break/20 flex items-center justify-center">
      <span className="text-pillar-break text-xl">!</span>
    </div>
    <div>
      <h2 className="text-lg font-medium text-text-primary mb-2">
        Failed to load data
      </h2>
      <p className="text-text-secondary text-sm">{message}</p>
    </div>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 rounded-lg bg-bg-secondary border border-border-subtle
                 text-text-primary text-sm font-medium
                 hover:border-border-strong transition-colors"
    >
      Try again
    </button>
  </div>
);

/**
 * Placeholder content for unimplemented views
 */
const PlaceholderContent = ({ viewMode }: { viewMode: string }) => {
  const viewLabels: Record<string, { title: string; description: string }> = {
    scrollytelling: {
      title: 'Story Mode',
      description: 'Guided narrative exploring AI governance patterns',
    },
    exploration: {
      title: 'Exploration Mode',
      description: 'Interactive data exploration with maps and charts',
    },
    comparison: {
      title: 'Comparison Mode',
      description: 'Side-by-side country analysis',
    },
  };

  const current = viewLabels[viewMode] ?? { title: 'Atlas', description: '' };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        {/* Decorative gradient orbs */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full bg-pillar-build/20 blur-2xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-pillar-break/20 blur-xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute inset-8 rounded-full bg-pillar-balance/20 blur-lg"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
          
          {/* Center icon placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-pillar-build" />
              <div className="w-3 h-3 rounded-full bg-pillar-break" />
              <div className="w-3 h-3 rounded-full bg-pillar-balance" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-text-primary mb-3">
          {current.title}
        </h2>
        <p className="text-text-secondary mb-6">
          {current.description}
        </p>
        <p className="text-text-tertiary text-sm">
          Coming soon
        </p>
      </motion.div>
    </div>
  );
};

