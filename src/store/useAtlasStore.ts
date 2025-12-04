import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  AtlasState,
  AtlasActions,
  Theme,
  ViewMode,
  ExplorationView,
  ActivePillar,
  Country,
  Cluster,
} from '@/types';
import { loadCountriesFromCSV } from '@/utils/dataLoader';
import { CLUSTER_DEFINITIONS } from '@/types';

/** Maximum number of countries for comparison mode */
const MAX_COMPARISON_COUNTRIES = 4;

/** Initial state for the Atlas store */
const initialState: AtlasState = {
  // Data
  countries: [],
  clusters: CLUSTER_DEFINITIONS,
  isLoading: false,
  error: null,

  // UI State
  theme: 'dark',
  viewMode: 'scrollytelling', // Default to story mode so new users see the intro
  explorationView: 'map',
  activePillar: 'build',
  sidebarOpen: true,
  countryPanelOpen: false,

  // Selection State
  hoveredCountry: null,
  selectedCountry: null,
  comparisonCountries: [],
  activeClusterFilter: null,

  // Scrollytelling State
  scrollyCurrentStep: 0,
  scrollyProgress: 0,
  scrollyComplete: false,
};

/**
 * Main Zustand store for the Atlas application
 * Manages all global state including data, UI, and user interactions
 */
export const useAtlasStore = create<AtlasState & AtlasActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // === Theme Actions ===
        setTheme: (theme: Theme) => {
          set({ theme }, false, 'setTheme');
          document.documentElement.setAttribute('data-theme', theme);
        },

        toggleTheme: () => {
          const newTheme = get().theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        // === View Navigation Actions ===
        setViewMode: (viewMode: ViewMode) => {
          set({ viewMode }, false, 'setViewMode');
        },

        setExplorationView: (explorationView: ExplorationView) => {
          set({ explorationView }, false, 'setExplorationView');
        },

        setActivePillar: (activePillar: ActivePillar) => {
          set({ activePillar }, false, 'setActivePillar');
        },

        // === UI Panel Actions ===
        setSidebarOpen: (sidebarOpen: boolean) => {
          set({ sidebarOpen }, false, 'setSidebarOpen');
        },

        setCountryPanelOpen: (countryPanelOpen: boolean) => {
          set({ countryPanelOpen }, false, 'setCountryPanelOpen');
        },

        // === Country Interaction Actions ===
        hoverCountry: (countryId: string | null) => {
          set({ hoveredCountry: countryId }, false, 'hoverCountry');
        },

        selectCountry: (countryId: string | null) => {
          set(
            {
              selectedCountry: countryId,
              countryPanelOpen: countryId !== null,
            },
            false,
            'selectCountry'
          );
        },

        // === Comparison Mode Actions ===
        addToComparison: (countryId: string) => {
          const { comparisonCountries } = get();
          
          // Prevent duplicates and limit max countries
          if (
            !comparisonCountries.includes(countryId) &&
            comparisonCountries.length < MAX_COMPARISON_COUNTRIES
          ) {
            set(
              { comparisonCountries: [...comparisonCountries, countryId] },
              false,
              'addToComparison'
            );
          }
        },

        removeFromComparison: (countryId: string) => {
          const { comparisonCountries } = get();
          set(
            {
              comparisonCountries: comparisonCountries.filter(
                (id) => id !== countryId
              ),
            },
            false,
            'removeFromComparison'
          );
        },

        clearComparison: () => {
          set({ comparisonCountries: [] }, false, 'clearComparison');
        },

        // === Filtering Actions ===
        setClusterFilter: (clusterId: string | null) => {
          set({ activeClusterFilter: clusterId }, false, 'setClusterFilter');
        },

        // === Scrollytelling Actions ===
        setScrollyStep: (scrollyCurrentStep: number) => {
          set({ scrollyCurrentStep }, false, 'setScrollyStep');
        },

        setScrollyProgress: (scrollyProgress: number) => {
          set({ scrollyProgress }, false, 'setScrollyProgress');
        },

        completeScrolly: () => {
          set({ scrollyComplete: true }, false, 'completeScrolly');
          // Save to localStorage that user has seen the story
          localStorage.setItem('atlas-scrolly-complete', 'true');
        },

        // === Data Loading Actions ===
        loadData: async () => {
          set({ isLoading: true, error: null }, false, 'loadData/start');

          try {
            const countries = await loadCountriesFromCSV('/data/countries-mock.csv');
            
            set(
              {
                countries,
                isLoading: false,
                error: null,
              },
              false,
              'loadData/success'
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to load country data';
            
            set(
              {
                isLoading: false,
                error: errorMessage,
              },
              false,
              'loadData/error'
            );
            
            console.error('Failed to load data:', error);
          }
        },
      }),
      {
        name: 'atlas-storage',
        // Only persist theme preference
        partialize: (state) => ({
          theme: state.theme,
        }),
      }
    ),
    { name: 'AtlasStore' }
  )
);

// === Selector Hooks ===

/** Get countries filtered by active cluster */
export const useFilteredCountries = () => {
  return useAtlasStore((state) => {
    if (!state.activeClusterFilter) {
      return state.countries;
    }
    return state.countries.filter(
      (country) => country.clusterId === state.activeClusterFilter
    );
  });
};

/** Get the currently selected country object */
export const useSelectedCountry = (): Country | undefined => {
  return useAtlasStore((state) =>
    state.countries.find((c) => c.id === state.selectedCountry)
  );
};

/** Get the currently hovered country object */
export const useHoveredCountry = (): Country | undefined => {
  return useAtlasStore((state) =>
    state.countries.find((c) => c.id === state.hoveredCountry)
  );
};

/** Get countries in comparison mode */
export const useComparisonCountries = (): Country[] => {
  return useAtlasStore((state) =>
    state.comparisonCountries
      .map((id) => state.countries.find((c) => c.id === id))
      .filter((c): c is Country => c !== undefined)
  );
};

/** Get cluster by ID */
export const useCluster = (clusterId: string): Cluster | undefined => {
  return useAtlasStore((state) =>
    state.clusters.find((c) => c.id === clusterId)
  );
};

/** Check if a country is in comparison */
export const useIsInComparison = (countryId: string): boolean => {
  return useAtlasStore((state) =>
    state.comparisonCountries.includes(countryId)
  );
};

// === Non-hook Selectors (for use outside components) ===

/** Get country by ID */
export const getCountryById = (id: string): Country | undefined => {
  return useAtlasStore.getState().countries.find((c) => c.id === id);
};

/** Get filtered countries based on current cluster filter */
export const getFilteredCountries = (): Country[] => {
  const state = useAtlasStore.getState();
  if (!state.activeClusterFilter) {
    return state.countries;
  }
  return state.countries.filter(
    (country) => country.clusterId === state.activeClusterFilter
  );
};

