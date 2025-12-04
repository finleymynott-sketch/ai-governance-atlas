import { useEffect } from 'react';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { Theme } from '@/types';

const THEME_STORAGE_KEY = 'atlas-theme';
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Hook to manage theme state and synchronization
 * - Persists preference to localStorage
 * - Respects system preference on first load
 * - Syncs with document attribute for CSS variable switching
 */
export const useTheme = () => {
  const theme = useAtlasStore((state) => state.theme);
  const setTheme = useAtlasStore((state) => state.setTheme);
  const toggleTheme = useAtlasStore((state) => state.toggleTheme);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      // Check localStorage first
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
        return;
      }

      // Fall back to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme: Theme = prefersDark ? 'dark' : 'light';
      setTheme(systemTheme);
    };

    initializeTheme();
  }, [setTheme]);

  // Sync theme changes to DOM and localStorage
  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

/**
 * Simple hook to check if dark mode is active
 */
export const useIsDarkMode = (): boolean => {
  return useAtlasStore((state) => state.theme === 'dark');
};

