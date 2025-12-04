import type { ActivePillar } from '@/types';

export interface ScrollyMapState {
  activePillar: ActivePillar | null;
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

export const scrollySteps: ScrollyStepConfig[] = [
  {
    id: 'hook',
    index: 0,
    headline: '',
    body: 'Every year, dozens of AI readiness rankings tell us which countries are "winning" the AI race.',
    mapState: {
      activePillar: null,
      highlightedCountries: [],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'setup',
    index: 1,
    headline: '',
    body: 'Two countries. Ranked almost identically.',
    mapState: {
      activePillar: null,
      highlightedCountries: ['USA', 'DEU'],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'reveal',
    index: 2,
    headline: 'Same score.',
    body: 'Completely different realities.',
    mapState: {
      activePillar: null,
      highlightedCountries: ['USA', 'DEU'],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: true,
    showComparisonBreakdown: true,
    showPillarTitle: null,
  },
  {
    id: 'framework',
    index: 3,
    headline: '',
    body: 'This atlas separates the story into three dimensions.',
    mapState: {
      activePillar: null,
      highlightedCountries: [],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'build',
    index: 4,
    headline: 'Build',
    body: 'The material capacity to develop AI. Data centres. Compute. Research.',
    mapState: {
      activePillar: 'build',
      highlightedCountries: [],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: 'build',
  },
  {
    id: 'break',
    index: 5,
    headline: 'Break',
    body: 'How exposed is the workforce? Which jobs face disruption?',
    mapState: {
      activePillar: 'break',
      highlightedCountries: [],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: 'break',
  },
  {
    id: 'balance',
    index: 6,
    headline: 'Balance',
    body: 'Not policy promises. Implemented governance. Actual protection.',
    mapState: {
      activePillar: 'balance',
      highlightedCountries: [],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: 'balance',
  },
  {
    id: 'gap',
    index: 7,
    headline: 'The Gap',
    body: 'Where does capability outpace governance?',
    mapState: {
      activePillar: 'risk',
      highlightedCountries: [],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
  {
    id: 'handoff',
    index: 8,
    headline: 'Explore for yourself.',
    body: '',
    mapState: {
      activePillar: 'build',
      highlightedCountries: [],
      showComparison: false,
      comparisonCountries: null,
      showClusters: false,
      zoomLevel: 1,
      centerOn: null,
    },
    showComparisonCard: false,
    showComparisonBreakdown: false,
    showPillarTitle: null,
  },
];

export const TOTAL_STEPS = scrollySteps.length;
