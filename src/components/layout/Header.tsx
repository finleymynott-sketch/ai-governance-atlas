import { motion } from 'framer-motion';
import { Globe2, BarChart3, GitCompare, FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { ViewMode } from '@/types';

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'scrollytelling', label: 'Story', icon: <Globe2 className="w-4 h-4" /> },
  { id: 'exploration', label: 'Explore', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'comparison', label: 'Compare', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'methodology', label: 'Methodology', icon: <FileText className="w-4 h-4" /> },
];

/**
 * Main header component with navigation and theme toggle
 * Premium styling with inner highlight and active indicator
 */
export const Header = () => {
  const viewMode = useAtlasStore((state) => state.viewMode);
  const setViewMode = useAtlasStore((state) => state.setViewMode);

  return (
    <header 
      className="
        relative sticky top-0 z-50 w-full 
        border-b border-border-subtle 
        bg-bg-secondary/95 backdrop-blur-lg
        header-container
      "
    >
      {/* Bottom highlight line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Title */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Logo - three coloured dots with glow on hover */}
          <motion.div 
            className="flex items-center gap-1.5 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-3 h-3 rounded-full bg-pillar-build"
              whileHover={{ scale: 1.2, boxShadow: '0 0 8px #F59E0B' }}
              transition={{ duration: 0.15 }}
            />
            <motion.div 
              className="w-3 h-3 rounded-full bg-pillar-break"
              whileHover={{ scale: 1.2, boxShadow: '0 0 8px #EF4444' }}
              transition={{ duration: 0.15, delay: 0.02 }}
            />
            <motion.div 
              className="w-3 h-3 rounded-full bg-pillar-balance"
              whileHover={{ scale: 1.2, boxShadow: '0 0 8px #10B981' }}
              transition={{ duration: 0.15, delay: 0.04 }}
            />
          </motion.div>
          
          {/* Title */}
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">
            <span className="hidden sm:inline">Build-Break-Balance Atlas</span>
            <span className="sm:hidden">B³ Atlas</span>
          </h1>
        </motion.div>

        {/* Navigation - desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = viewMode === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg
                  text-sm font-medium cursor-pointer
                  transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                  ${isActive 
                    ? 'text-text-primary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                  }
                `}
                whileTap={{ scale: 0.98 }}
              >
                {item.icon}
                <span>{item.label}</span>
                
                {/* Active indicator - underline */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-x-2 -bottom-[17px] h-0.5 bg-accent-primary rounded-full"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center gap-1">
          {navItems.map((item) => {
            const isActive = viewMode === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-lg
                  cursor-pointer
                  transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                  ${isActive 
                    ? 'text-text-primary bg-bg-tertiary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                  }
                `}
                whileTap={{ scale: 0.95 }}
                aria-label={item.label}
              >
                {item.icon}
              </motion.button>
            );
          })}
        </nav>

        {/* Right side actions */}
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ThemeToggle />
        </motion.div>
      </div>
    </header>
  );
};
