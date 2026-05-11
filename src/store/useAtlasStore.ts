import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  AtlasActions,
  AtlasState,
  ClusterId,
  Country,
  MapMode,
  Theme,
  ViewMode,
} from '@/types';
import { CLUSTER_DEFINITIONS } from '@/types';
import { loadCountries } from '@/utils/dataLoader';

const MAX_COMPARISON_COUNTRIES = 4;

const initialState: AtlasState = {
  countries: [],
  clusters: CLUSTER_DEFINITIONS,
  isLoading: false,
  error: null,

  theme: 'dark',
  viewMode: 'scrollytelling',
  mapMode: 'risk',
  sidebarOpen: true,
  countryPanelOpen: false,

  hoveredCountry: null,
  selectedCountry: null,
  comparisonCountries: [],
  activeClusterFilter: null,

  scrollyCurrentStep: 0,
  scrollyComplete: false,
};

export const useAtlasStore = create<AtlasState & AtlasActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setTheme: (theme: Theme) => {
          set({ theme }, false, 'setTheme');
          document.documentElement.setAttribute('data-theme', theme);
        },

        toggleTheme: () => {
          get().setTheme(get().theme === 'light' ? 'dark' : 'light');
        },

        setViewMode: (viewMode: ViewMode) => {
          set({ viewMode }, false, 'setViewMode');
        },

        setMapMode: (mapMode: MapMode) => {
          set({ mapMode }, false, 'setMapMode');
        },

        setSidebarOpen: (sidebarOpen: boolean) => {
          set({ sidebarOpen }, false, 'setSidebarOpen');
        },

        setCountryPanelOpen: (countryPanelOpen: boolean) => {
          set({ countryPanelOpen }, false, 'setCountryPanelOpen');
        },

        hoverCountry: (countryId: string | null) => {
          set({ hoveredCountry: countryId }, false, 'hoverCountry');
        },

        selectCountry: (countryId: string | null) => {
          set(
            { selectedCountry: countryId, countryPanelOpen: countryId !== null },
            false,
            'selectCountry'
          );
        },

        addToComparison: (countryId: string) => {
          const { comparisonCountries } = get();
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
          set(
            {
              comparisonCountries: get().comparisonCountries.filter((id) => id !== countryId),
            },
            false,
            'removeFromComparison'
          );
        },

        clearComparison: () => {
          set({ comparisonCountries: [] }, false, 'clearComparison');
        },

        setClusterFilter: (clusterId: ClusterId | null) => {
          set({ activeClusterFilter: clusterId }, false, 'setClusterFilter');
        },

        setScrollyStep: (scrollyCurrentStep: number) => {
          set({ scrollyCurrentStep }, false, 'setScrollyStep');
        },

        completeScrolly: () => {
          set({ scrollyComplete: true }, false, 'completeScrolly');
          localStorage.setItem('atlas-scrolly-complete', 'true');
        },

        loadData: async () => {
          set({ isLoading: true, error: null }, false, 'loadData/start');
          try {
            const countries = await loadCountries();
            set({ countries, isLoading: false, error: null }, false, 'loadData/success');
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to load country data';
            set({ isLoading: false, error: errorMessage }, false, 'loadData/error');
            console.error('Failed to load data:', error);
          }
        },
      }),
      {
        name: 'atlas-storage',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: 'AtlasStore' }
  )
);

// === Selector hooks ===

export const useSelectedCountry = (): Country | undefined =>
  useAtlasStore((state) => state.countries.find((c) => c.id === state.selectedCountry));

export const useHoveredCountry = (): Country | undefined =>
  useAtlasStore((state) => state.countries.find((c) => c.id === state.hoveredCountry));

export const useComparisonCountries = (): Country[] =>
  useAtlasStore((state) =>
    state.comparisonCountries
      .map((id) => state.countries.find((c) => c.id === id))
      .filter((c): c is Country => c !== undefined)
  );

export const useIsInComparison = (countryId: string): boolean =>
  useAtlasStore((state) => state.comparisonCountries.includes(countryId));
