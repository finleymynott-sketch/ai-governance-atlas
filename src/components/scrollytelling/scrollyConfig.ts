import type { MapMode } from '@/types';

export interface ScrollyMapState {
  mapMode: MapMode | null;
  highlightedCountries: string[];
  showComparison: boolean;
  comparisonCountries: [string, string] | null;
  showClusters: boolean;
  zoomLevel: number;
  centerOn: [number, number] | null;
}

export interface ScrollyStepConfig {
  id: string;
  index: number;
  headline: string;
  body: string;
  mapState: ScrollyMapState;
  showComparisonCard: boolean;
  showComparisonBreakdown: boolean;
  showPillarTitle: 'build' | 'break' | 'balance' | null;
}

const emptyMap: ScrollyMapState = {
  mapMode: null,
  highlightedCountries: [],
  showComparison: false,
  comparisonCountries: null,
  showClusters: false,
  zoomLevel: 1,
  centerOn: null,
};

/**
 * Scrolly narrative, in the dissertation's own voice. Each slide either teaches
 * the framework or surfaces one of the dissertation's headline findings:
 * (1) the governance gap, (2) the demographic paradox, (3) the cluster
 * typology, (4) the worker-protection finding.
 */
export const scrollySteps: ScrollyStepConfig[] = [
  {
    id: 'hook',
    index: 0,
    headline: '',
    body:
      'Major AI readiness indices average capability and governance into a single score. When strength in one dimension offsets weakness in another, the gap between them never surfaces in the output. It has been averaged away.',
    mapState: emptyMap,
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'setup',
    index: 1,
    headline: 'Same exposure.',
    body:
      'Japan and the United States face almost identical AI task exposure — 0.319 and 0.315 on the raw measure. Both sit at the top of the capability distribution.',
    mapState: {
      ...emptyMap,
      highlightedCountries: ['USA', 'JPN'],
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'reveal',
    index: 2,
    headline: 'Opposite risk.',
    body:
      'Japan registers zero displacement risk. The United States ranks seventh. Same exposure, filtered through different demographic structures, produces fundamentally different risk profiles. The framework does not claim Japan faces no consequences from AI — it claims Japan faces zero displacement risk because its aging workforce transforms exposure into shortage-filling.',
    mapState: {
      ...emptyMap,
      highlightedCountries: ['USA', 'JPN'],
    },
    showComparisonCard: true,
    showComparisonBreakdown: true,
    showPillarTitle: null,
  },
  {
    id: 'framework',
    index: 3,
    headline: 'Three pillars, kept distinct.',
    body:
      'Build, Break, Balance — borrowed from disaster-risk geography as Hazard, Exposure, Resilience. Diagnostically non-compensatory: each pillar is reported and interpretable independently.',
    mapState: emptyMap,
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'build',
    index: 4,
    headline: 'Build',
    body:
      'AI systems are not weightless. Training and running large models requires hardware supply chains, energy infrastructure, cooling systems, physical space. These things have geography. The framework splits Build into supply (domestic infrastructure) and access (external connectivity) because their governance implications differ.',
    mapState: {
      ...emptyMap,
      mapMode: 'hazard',
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: 'build',
  },
  {
    id: 'break',
    index: 5,
    headline: 'Break',
    body:
      'Take two countries with the same task-exposure score. In Nigeria, the workforce is young and expanding — automation competes directly with available workers. In Japan, the workforce is aging and shrinking — automation could be filling gaps demographic change has already created. Same number. Completely different situation.',
    mapState: {
      ...emptyMap,
      mapMode: 'break-displacement',
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: 'break',
  },
  {
    id: 'balance',
    index: 6,
    headline: 'Balance',
    body:
      'GDPR makes this concrete. Same legal text across every EU member state. Completely different enforcement outcomes. Measuring only legal architecture would miss this variation. The framework scores governance across five sub-pillars × de jure / de facto — capturing the implementation gap, not just the policy on paper.',
    mapState: {
      ...emptyMap,
      mapMode: 'balance',
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: 'balance',
  },
  {
    id: 'singapore',
    index: 7,
    headline: 'Singapore: the commensuration case.',
    body:
      "Singapore scores 3 out of 3 on Audit and Enforcement — among the highest in the dataset. It scores 0 out of 3 on Worker Protection. A single governance composite would rate Singapore as moderately governed. The five sub-pillars reveal a country with one of the strongest audit infrastructures in the sample and no worker displacement protections whatsoever. Across the full sample, 14 of 47 sovereign states score zero on Worker Protection.",
    mapState: {
      ...emptyMap,
      mapMode: 'balance',
      highlightedCountries: ['SGP'],
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'gap',
    index: 8,
    headline: 'The governance gap.',
    body:
      'The five countries this framework identifies as facing the greatest AI governance risk — the UAE, Singapore, Saudi Arabia, Israel and Malaysia — are precisely the countries that major readiness indices rank among the most AI-ready. Compensatory aggregation averages the gap away. Build is a risk factor here, not a protective factor.',
    mapState: {
      ...emptyMap,
      mapMode: 'risk',
      highlightedCountries: ['ARE', 'SGP', 'SAU', 'ISR', 'MYS'],
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'handoff',
    index: 9,
    headline: 'Explore for yourself.',
    body: 'Click any country to open its full profile. The Rankings view shows the headline table.',
    mapState: {
      ...emptyMap,
      mapMode: 'risk',
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
];

export const TOTAL_STEPS = scrollySteps.length;
