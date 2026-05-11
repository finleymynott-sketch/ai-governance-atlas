import { useEffect } from 'react';
import { useAtlasStore } from '@/store/useAtlasStore';

const THEME_ATTRIBUTE = 'data-theme';

/**
 * Initialise the theme on mount: respect the user's persisted Zustand
 * preference, or fall back to system colour-scheme if nothing is stored.
 * Persistence is owned by the store's `persist` middleware — this hook only
 * keeps the DOM attribute in sync.
 */
export const useTheme = () => {
  const theme = useAtlasStore((state) => state.theme);
  const setTheme = useAtlasStore((state) => state.setTheme);
  const toggleTheme = useAtlasStore((state) => state.toggleTheme);

  // Keep the DOM attribute aligned with store state.
  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }, [theme]);

  // First-visit fallback to system preference. We can't tell whether the store
  // hydrated from persistence or fell back to its 'dark' default, so we only
  // apply system preference if no `atlas-storage` localStorage entry exists.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const persisted = window.localStorage.getItem('atlas-storage');
    if (!persisted) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    // We intentionally don't re-run on setTheme changes — this is a one-shot
    // mount-time fallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

export const useIsDarkMode = (): boolean => useAtlasStore((state) => state.theme === 'dark');
