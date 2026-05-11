/**
 * Core types for the Build-Break-Balance Atlas.
 *
 * Framework source: Mynott, F. (XWHV6). "Build–Break–Balance: A Non-Compensatory
 * Framework for Cross-National AI Governance Risk Assessment." UCL Geography
 * Department, 2026. Vocabulary, formulas, and cluster labels follow the
 * dissertation verbatim.
 *
 * The conceptual heritage is Hazard / Exposure / Resilience (disaster-risk
 * geography). The framework's branded labels are Build / Break / Balance.
 * Section headers in the dissertation pair them as "Hazard (Build)".
 */

// === Core country shape ===

export interface Country {
  /** ISO 3166-1 alpha-3 code, or "EU" for the supranational unit. */
  id: string;
  /** Full country name as it appears in the dissertation. */
  name: string;
  /** UN geoscheme grouping (lookup, since the source CSV has no region). */
  region: string;

  build: BuildPillar;
  break: BreakPillar;
  balance: BalancePillar;
  risk: RiskComposite;
  cluster: ClusterAssignment;
  flags: CountryFlags;
}

/**
 * Build = "where AI capability physically concentrates".
 * Headline number is `hazard`, the probabilistic union of supply and access.
 * Channels stay separate for risk computation so governance can moderate each.
 */
export interface BuildPillar {
  /** hazard = 1 − (1 − supply)(1 − access). Used for clustering and map coloring. */
  hazard: number;
  /** Domestic deployment capacity: cloud regions, colocation density, grid reliability. */
  supply: number;
  /** External service connectivity: internet penetration, bandwidth per user. */
  access: number;
  /** Raw (winsorised, min-max normalised) indicators. */
  indicators: {
    cloudRegionsTotal: number;
    cloudRegionsDomestic: number;
    colocationPerMillion: number;
    gridReliability: number;
    internetPenetration: number;
    bandwidthPerUser: number;
  };
}

/**
 * Break = "where labour markets face AI-driven task exposure".
 * The decomposition into displacement vs shortage is the framework's most
 * consequential design decision: same task exposure produces opposite governance
 * challenges depending on demographic structure.
 */
export interface BreakPillar {
  /** displacement = exposure × (1 − OADR_norm). Enters the risk formula. */
  displacement: number;
  /** shortage = exposure × OADR_norm. Companion indicator. Does NOT enter risk. */
  shortage: number;
  indicators: {
    exposureRaw: number;
    oadrRaw: number;
  };
}

/**
 * Balance = "whether governance institutions have the implemented capacity to
 * manage disruption". Documented governance evidence, not governance itself —
 * "a conservative lower bound" per the dissertation.
 *
 * Five sub-pillars × {de_jure 0–3, de_facto 0–3}, requires ≥4 of 5 observed.
 */
export interface BalancePillar {
  /** balance_raw ∈ [0, 1]. Per-sub-pillar (de_jure + de_facto)/2, averaged across observed pillars, divided by 3. */
  raw: number;
  /** balance_supply = balance_raw × sovereignty. Effective governance over domestically-hosted infrastructure. */
  supply: number;
  /** balance_access = balance_raw. Effective governance over imported AI services. */
  access: number;
  /** Sovereignty discount factor S ∈ [0.5, 1.0]. Only modifies supply. */
  sovereignty: number;
  /** Five sub-pillars. May be empty when per-document scoring is not yet available. */
  dimensions: BalanceDimension[];
}

export type BalanceDimensionId =
  | 'law_and_institutions'
  | 'standards'
  | 'audit_and_enforcement'
  | 'worker_protection'
  | 'transparency';

export interface BalanceDimension {
  id: BalanceDimensionId;
  /** Compact label used in charts: "Law & Institutions", "Worker Protection", etc. */
  shortLabel: string;
  /** Full conceptual label from Chapter 2 of the dissertation. */
  longLabel: string;
  /** Bureaucrat perspective, 0–3 scale. Null if not scored. */
  deJure: number | null;
  /** Skeptic perspective, 0–3 scale. Null if not scored. */
  deFacto: number | null;
  /** de_jure − de_facto. Null if either is missing. */
  gap: number | null;
}

/**
 * Net Displacement Risk — the headline composite. Two-channel multiplicative
 * specification, then probabilistic union.
 *   risk_supply = build_supply × break_displacement × (1 − balance_supply)
 *   risk_access = build_access × break_displacement × (1 − balance_access)
 *   risk = 1 − (1 − risk_supply)(1 − risk_access)
 */
export interface RiskComposite {
  /** Range [0, 1]. Use for tables, sorting, comparison. */
  total: number;
  supply: number;
  access: number;
  /** risk^(1/3). For choropleth coloring only — does not alter rank order. */
  viz: number;
  /** 1-indexed rank within the 48-unit sample (1 = highest risk). */
  rank: number;
}

export interface ClusterAssignment {
  /** 1-5, matching the dissertation prose (CSV uses 0-4; we add 1 on load). */
  id: ClusterId;
  /** Verbatim dissertation label. */
  label: string;
  /** Whether this country is the cluster medoid. */
  isMedoid: boolean;
  /** Bootstrap membership stability, [0, 1]. */
  stability: number;
  /** True if stability < 0.70 — dissertation's threshold for typological stability. */
  unstable: boolean;
}

export type ClusterId = 1 | 2 | 3 | 4 | 5;

export interface CountryFlags {
  /**
   * Kafala / migrant-workforce caveat. The dissertation flags that OADR may not
   * reflect labour scarcity in Gulf states with kafala sponsorship regimes;
   * UAE and Saudi Arabia's headline rankings rest on a proxy whose validity is
   * weakest for those countries.
   */
  kafalaCaveat: boolean;
  /**
   * Two distinct pathways to risk = 0. Yellow = aging-buffer (JPN, FIN, PRT);
   * green = no-infrastructure (ETH). The only colour convention the dissertation
   * specifies explicitly.
   */
  zeroRiskPathway: 'aging' | 'no-infra' | null;
  /** EU is included as a supranational entity — no map polygon. */
  isSupranational: boolean;
}

// === Cluster metadata ===

export interface Cluster {
  id: ClusterId;
  /** Verbatim dissertation label. */
  label: string;
  /** Short form for legend chips. */
  shortName: string;
  /** Member count from run_20260311_133135. */
  memberCount: number;
  /** Medoid country ISO3. */
  medoidId: string;
  /** Hex colour. */
  color: string;
  /** Dissertation-grounded archetype description. */
  description: string;
}

/**
 * Cluster definitions with names taken verbatim from the dissertation's
 * Section 4.4 and Appendix B Table B.2.
 */
export const CLUSTER_DEFINITIONS: Cluster[] = [
  {
    id: 1,
    label: 'EU regulatory',
    shortName: 'EU regulatory',
    memberCount: 16,
    medoidId: 'ESP',
    color: '#10B981',
    description:
      'Predominantly European, including 14 EU member states plus the United Kingdom and the EU itself. Highest mean Balance (0.55), lowest mean Risk (0.09). High capability with the regulatory frameworks to moderate it.',
  },
  {
    id: 2,
    label: 'Emerging',
    shortName: 'Emerging',
    memberCount: 12,
    medoidId: 'PHL',
    color: '#F59E0B',
    description:
      'Middle-income emerging economies across Latin America, Sub-Saharan Africa and South/Southeast Asia. Moderate Hazard (0.65), low Balance (0.25). Build substantially exceeds Balance in level.',
  },
  {
    id: 3,
    label: 'High-income non-EU',
    shortName: 'High-income non-EU',
    memberCount: 9,
    medoidId: 'CHE',
    color: '#3B82F6',
    description:
      'High-income economies outside the EU regulatory framework: USA, Japan, South Korea, Australia, Canada, Chile, Switzerland, Thailand, Vietnam. Highest mean Hazard (0.94), most heterogeneous Break-displacement.',
  },
  {
    id: 4,
    label: 'Low-income',
    shortName: 'Low-income',
    memberCount: 6,
    medoidId: 'PAK',
    color: '#6B7280',
    description:
      'Low-income economies with near-zero Hazard (0.23) and near-zero Risk (0.02). No cloud regions in any cluster member. Risk is low because the infrastructure to generate disruption is largely absent — not because governance is strong.',
  },
  {
    id: 5,
    label: 'High-risk',
    shortName: 'High-risk',
    memberCount: 5,
    medoidId: 'ISR',
    color: '#EF4444',
    description:
      'The Gulf states, Israel, Malaysia and Singapore. Highest mean Risk (0.56), highest Break-displacement (0.58), lowest Balance (0.20) — lower than the low-income cluster. The cluster where the governance gap concentrates. In this run, Israel, Malaysia and Singapore fall below the 0.70 stability threshold — assignment is sensitive to sample composition.',
  },
];

// === Map modes (replaces the old ActivePillar concept) ===

/**
 * Each "map mode" is a different visual treatment of the data. The dissertation
 * has six figures (Fig 2 Risk choropleth, Fig 3 pillar profiles, Fig 4 Hazard×Break
 * scatter, Fig 5 cluster separation, Fig 6 typology choropleth). The Atlas
 * surfaces those as interactive map modes.
 */
export type MapMode =
  | 'hazard'
  | 'build-supply'
  | 'build-access'
  | 'break-displacement'
  | 'break-shortage'
  | 'balance'
  | 'risk'
  | 'bivariate'
  | 'clusters'
  | 'sovereignty';

export interface MapModeConfig {
  id: MapMode;
  label: string;
  shortLabel: string;
  /** Which pillar this mode belongs to (or 'composite' / 'typology'). */
  pillar: 'build' | 'break' | 'balance' | 'risk' | 'composite' | 'typology';
  /** One-line description for tooltips / panels. */
  description: string;
  /** Hex colour anchor — top of scale for continuous modes, accent for categorical. */
  color: string;
  /** CSS variable that mirrors the colour for theme-aware components. */
  cssVar: string;
}

export const MAP_MODE_CONFIG: Record<MapMode, MapModeConfig> = {
  hazard: {
    id: 'hazard',
    label: 'Hazard (Build)',
    shortLabel: 'Hazard',
    pillar: 'build',
    description: 'Probabilistic union of domestic supply and external access. Where AI capability physically concentrates.',
    color: '#F59E0B',
    cssVar: '--color-build',
  },
  'build-supply': {
    id: 'build-supply',
    label: 'Build — supply channel',
    shortLabel: 'Build supply',
    pillar: 'build',
    description: 'Domestic AI deployment capacity: cloud regions, colocation density, grid reliability.',
    color: '#FBBF24',
    cssVar: '--color-build',
  },
  'build-access': {
    id: 'build-access',
    label: 'Build — access channel',
    shortLabel: 'Build access',
    pillar: 'build',
    description: 'External AI service connectivity: internet penetration, bandwidth per user.',
    color: '#FCD34D',
    cssVar: '--color-build',
  },
  'break-displacement': {
    id: 'break-displacement',
    label: 'Exposure (Break) — displacement',
    shortLabel: 'Displacement',
    pillar: 'break',
    description: 'Exposure × (1 − OADR_norm). The risk-relevant term. Young workforces with high AI exposure.',
    color: '#EF4444',
    cssVar: '--color-break',
  },
  'break-shortage': {
    id: 'break-shortage',
    label: 'Exposure (Break) — shortage',
    shortLabel: 'Shortage',
    pillar: 'break',
    description: 'Exposure × OADR_norm. Companion indicator: AI may fill shortages where workforce is aging.',
    color: '#F87171',
    cssVar: '--color-break',
  },
  balance: {
    id: 'balance',
    label: 'Resilience (Balance)',
    shortLabel: 'Balance',
    pillar: 'balance',
    description: 'Documented governance capacity across five sub-pillars × de jure / de facto. A conservative lower bound.',
    color: '#10B981',
    cssVar: '--color-balance',
  },
  risk: {
    id: 'risk',
    label: 'Net Displacement Risk',
    shortLabel: 'Risk',
    pillar: 'risk',
    description: 'risk = 1 − (1 − risk_supply)(1 − risk_access). The headline composite. Colour scale uses risk^(1/3).',
    color: '#8B5CF6',
    cssVar: '--color-risk',
  },
  bivariate: {
    id: 'bivariate',
    label: 'Hazard × Break',
    shortLabel: 'Bivariate',
    pillar: 'composite',
    description: 'Bivariate choropleth on the two independent dimensions, before governance moderates them.',
    color: '#8B5CF6',
    cssVar: '--color-risk',
  },
  clusters: {
    id: 'clusters',
    label: 'Country typologies',
    shortLabel: 'Clusters',
    pillar: 'typology',
    description: 'Five archetypes from k-medoids clustering. Hatching marks members below the 0.70 stability threshold.',
    color: '#A78BFA',
    cssVar: '--color-risk',
  },
  sovereignty: {
    id: 'sovereignty',
    label: 'Sovereignty discount',
    shortLabel: 'Sovereignty',
    pillar: 'balance',
    description: 'S = 0.5 + 0.5 × (domestic cloud regions / total). USA-only differentiation among countries with cloud presence.',
    color: '#14B8A6',
    cssVar: '--color-balance',
  },
};

// === Pillar metadata (used by section headers, country panels, methodology) ===

export type PillarId = 'build' | 'break' | 'balance' | 'risk';

export interface PillarConfig {
  id: PillarId;
  /** Branded label used in headers and prose. */
  label: string;
  /** Conceptual heritage label from disaster-risk geography. */
  conceptLabel: 'Hazard' | 'Exposure' | 'Resilience' | 'Risk';
  /** One-sentence description in the dissertation's voice. */
  tagline: string;
  color: string;
  cssVar: string;
}

export const PILLAR_CONFIG: Record<PillarId, PillarConfig> = {
  build: {
    id: 'build',
    label: 'Build',
    conceptLabel: 'Hazard',
    tagline: 'Where AI capability physically concentrates. Capability treated as a risk factor, not an asset.',
    color: '#F59E0B',
    cssVar: '--color-build',
  },
  break: {
    id: 'break',
    label: 'Break',
    conceptLabel: 'Exposure',
    tagline: 'Where labour markets face AI-driven task exposure. Decomposed into displacement and shortage by demographics.',
    color: '#EF4444',
    cssVar: '--color-break',
  },
  balance: {
    id: 'balance',
    label: 'Balance',
    conceptLabel: 'Resilience',
    tagline: 'Whether governance has the implemented capacity to manage disruption. Documented evidence, not governance itself.',
    color: '#10B981',
    cssVar: '--color-balance',
  },
  risk: {
    id: 'risk',
    label: 'Risk',
    conceptLabel: 'Risk',
    tagline: 'Net Displacement Risk. Multiplicative composite of Build × Break × (1 − Balance), unioned across channels.',
    color: '#8B5CF6',
    cssVar: '--color-risk',
  },
};

// === Balance sub-pillar metadata ===

export const BALANCE_DIMENSION_META: Record<BalanceDimensionId, { short: string; long: string }> = {
  law_and_institutions: {
    short: 'Law & Institutions',
    long: 'Legal and Institutional Framework',
  },
  standards: {
    short: 'Standards',
    long: 'Standards and Certification Infrastructure',
  },
  audit_and_enforcement: {
    short: 'Audit & Enforcement',
    long: 'Audit and Oversight Capacity',
  },
  worker_protection: {
    short: 'Worker Protection',
    long: 'Worker Protection and Adaptation Systems',
  },
  transparency: {
    short: 'Transparency',
    long: 'Transparency and Participation Mechanisms',
  },
};

// === UI / view types ===

export type ViewMode = 'scrollytelling' | 'exploration' | 'comparison' | 'rankings' | 'methodology';

export type Theme = 'light' | 'dark';

// === Store state ===

export interface AtlasState {
  countries: Country[];
  clusters: Cluster[];
  isLoading: boolean;
  error: string | null;

  theme: Theme;
  viewMode: ViewMode;
  /** Active map mode in exploration view. */
  mapMode: MapMode;
  sidebarOpen: boolean;
  countryPanelOpen: boolean;

  hoveredCountry: string | null;
  selectedCountry: string | null;
  comparisonCountries: string[];
  activeClusterFilter: ClusterId | null;

  scrollyCurrentStep: number;
  scrollyComplete: boolean;
}

export interface AtlasActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setViewMode: (mode: ViewMode) => void;
  setMapMode: (mode: MapMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setCountryPanelOpen: (open: boolean) => void;
  hoverCountry: (countryId: string | null) => void;
  selectCountry: (countryId: string | null) => void;
  addToComparison: (countryId: string) => void;
  removeFromComparison: (countryId: string) => void;
  clearComparison: () => void;
  setClusterFilter: (clusterId: ClusterId | null) => void;
  setScrollyStep: (step: number) => void;
  completeScrolly: () => void;
  loadData: () => Promise<void>;
}

// === CSV row shapes (for PapaParse typing) ===

export interface MasterCountryRow {
  country_iso3: string;
  country_name: string;
  year_ref: string;
  cloud_regions_total: string;
  cloud_regions_domestic: string;
  colocation_per_million: string;
  colocation_datacenters: string;
  population: string;
  grid_reliability: string;
  internet_penetration: string;
  bandwidth_per_user: string;
  exposure_raw: string;
  oadr_raw: string;
  balance_raw: string;
  build_supply: string;
  build_access: string;
  hazard: string;
  break_displacement: string;
  break_shortage: string;
  sovereignty_s: string;
  balance_supply: string;
  balance_access: string;
  risk_supply: string;
  risk_access: string;
  risk: string;
  risk_viz: string;
  risk_rank: string;
  cluster_label: string;
  is_medoid: string;
  membership_stability: string;
  typology_unstable: string;
}

export interface ClusterAssignmentRow {
  country_iso3: string;
  cluster_label: string;
  cluster_k: string;
  is_medoid: string;
  membership_stability: string;
  typology_unstable: string;
}

/**
 * Per-document governance scoring row. Wide schema with 5 dimensions × 9 fields
 * each. The dataLoader collapses multiple documents per country into a single
 * BalancePillar.dimensions array by averaging where countries have multiple docs.
 */
export interface GovernanceDocumentRow {
  country_iso3: string;
  country: string;
  country_name: string;
  document_count: string;
  balance_raw: string;
  // Five dimensions, each with de_jure / de_facto / gap / confidence / status / quote / source / n_docs.
  // PapaParse will give us untyped extras — we read what we need by string key.
  [key: string]: string;
}
