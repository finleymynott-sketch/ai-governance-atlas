/**
 * Core TypeScript types for the Build-Break-Balance Atlas
 * AI Governance Visualization Platform
 */

// === Core Data Types ===

export interface Country {
  /** ISO 3166-1 alpha-3 code: "GBR", "USA", "DEU" */
  id: string;
  /** Full country name */
  name: string;
  /** Geographic/political region */
  region: string;
  /** AI capability and infrastructure capacity */
  build: PillarScore;
  /** Labour market exposure to AI automation */
  break: PillarScore;
  /** Governance readiness and regulatory capacity */
  balance: PillarScore;
  /** Gap between Build and Balance: higher = more risk */
  riskImbalance: number;
  /** Cluster assignment for typology grouping */
  clusterId: string;
}

export interface PillarScore {
  /** Composite score, 0-1 normalized */
  overall: number;
  /** Individual indicator scores */
  indicators: Record<string, number>;
}

export interface Cluster {
  /** Unique cluster identifier */
  id: string;
  /** Full descriptive name */
  name: string;
  /** Abbreviated name for UI */
  shortName: string;
  /** Explanation of cluster characteristics */
  description: string;
  /** Hex color for visualization */
  color: string;
}

// === UI State Types ===

/** Primary navigation mode */
export type ViewMode = 'scrollytelling' | 'exploration' | 'comparison' | 'methodology';

/** Visualization type within exploration mode */
export type ExplorationView = 'map' | 'scatter' | 'tension';

/** Currently active pillar for filtering/highlighting */
export type ActivePillar = 'build' | 'break' | 'balance' | 'risk';

/** Theme preference */
export type Theme = 'light' | 'dark';

// === Store State Interface ===

export interface AtlasState {
  // Data
  countries: Country[];
  clusters: Cluster[];
  isLoading: boolean;
  error: string | null;

  // UI State
  theme: Theme;
  viewMode: ViewMode;
  explorationView: ExplorationView;
  activePillar: ActivePillar;
  sidebarOpen: boolean;
  countryPanelOpen: boolean;

  // Selection State
  hoveredCountry: string | null;
  selectedCountry: string | null;
  comparisonCountries: string[];
  activeClusterFilter: string | null;

  // Scrollytelling State
  scrollyCurrentStep: number;
  scrollyProgress: number;
  scrollyComplete: boolean;
}

// === Store Actions Interface ===

export interface AtlasActions {
  // Theme
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // View Navigation
  setViewMode: (mode: ViewMode) => void;
  setExplorationView: (view: ExplorationView) => void;
  setActivePillar: (pillar: ActivePillar) => void;

  // UI Panels
  setSidebarOpen: (open: boolean) => void;
  setCountryPanelOpen: (open: boolean) => void;

  // Country Interactions
  hoverCountry: (countryId: string | null) => void;
  selectCountry: (countryId: string | null) => void;

  // Comparison Mode
  addToComparison: (countryId: string) => void;
  removeFromComparison: (countryId: string) => void;
  clearComparison: () => void;

  // Filtering
  setClusterFilter: (clusterId: string | null) => void;

  // Scrollytelling
  setScrollyStep: (step: number) => void;
  setScrollyProgress: (progress: number) => void;
  completeScrolly: () => void;

  // Data Loading
  loadData: () => Promise<void>;
}

// === Derived/Computed Types ===

export interface CountryWithCluster extends Country {
  cluster: Cluster | undefined;
}

/** Pillar configuration for visualization */
export interface PillarConfig {
  id: ActivePillar;
  label: string;
  description: string;
  color: string;
  cssVar: string;
}

/** Cluster definitions with metadata */
export const CLUSTER_DEFINITIONS: Cluster[] = [
  {
    id: 'high-build-low-balance',
    name: 'High Capability, Low Governance',
    shortName: 'Tech Leaders at Risk',
    description: 'Countries with strong AI infrastructure but lagging regulatory frameworks',
    color: '#EF4444',
  },
  {
    id: 'balanced-high',
    name: 'Balanced High Performers',
    shortName: 'Balanced Leaders',
    description: 'Countries with both strong AI capability and robust governance',
    color: '#10B981',
  },
  {
    id: 'balanced-low',
    name: 'Balanced Low Performers',
    shortName: 'Developing Nations',
    description: 'Countries with lower AI activity and proportionally scaled governance',
    color: '#6B7280',
  },
  {
    id: 'low-build-high-balance',
    name: 'Low Capability, High Governance',
    shortName: 'Governance Leaders',
    description: 'Countries prioritizing regulatory frameworks ahead of AI development',
    color: '#3B82F6',
  },
  {
    id: 'emerging',
    name: 'Emerging AI Economies',
    shortName: 'Emerging',
    description: 'Rapidly developing AI capabilities with evolving governance',
    color: '#F59E0B',
  },
];

/** Pillar configuration constants */
export const PILLAR_CONFIG: Record<ActivePillar, PillarConfig> = {
  build: {
    id: 'build',
    label: 'Build',
    description: 'AI capability and infrastructure capacity',
    color: '#F59E0B',
    cssVar: '--color-build',
  },
  break: {
    id: 'break',
    label: 'Break',
    description: 'Labour market exposure to AI automation',
    color: '#EF4444',
    cssVar: '--color-break',
  },
  balance: {
    id: 'balance',
    label: 'Balance',
    description: 'Governance readiness and regulatory capacity',
    color: '#10B981',
    cssVar: '--color-balance',
  },
  risk: {
    id: 'risk',
    label: 'Risk Imbalance',
    description: 'Gap between Build capability and Balance governance',
    color: '#8B5CF6',
    cssVar: '--color-risk',
  },
};

// === CSV Row Type (for parsing) ===

export interface CountryCSVRow {
  id: string;
  name: string;
  region: string;
  build_overall: string;
  build_compute: string;
  build_datacentres: string;
  build_energy: string;
  build_research: string;
  break_overall: string;
  break_exposure: string;
  break_complementarity: string;
  balance_overall: string;
  balance_legal: string;
  balance_standards: string;
  balance_audit: string;
  balance_worker: string;
  balance_transparency: string;
  cluster_id: string;
}

