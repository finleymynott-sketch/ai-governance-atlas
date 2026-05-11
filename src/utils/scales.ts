import * as d3 from 'd3';
import type { ClusterId, Country, MapMode, PillarId } from '@/types';
import { CLUSTER_DEFINITIONS, MAP_MODE_CONFIG, PILLAR_CONFIG } from '@/types';
import { valueForMode } from '@/utils/dataLoader';

// === Pillar colours ===

export const PILLAR_COLORS: Record<PillarId, string> = {
  build: PILLAR_CONFIG.build.color,
  break: PILLAR_CONFIG.break.color,
  balance: PILLAR_CONFIG.balance.color,
  risk: PILLAR_CONFIG.risk.color,
};

export const getPillarCSSVar = (pillar: PillarId): string => `var(${PILLAR_CONFIG[pillar].cssVar})`;

/**
 * Continuous colour scale anchored on a map mode. Light → saturated for the
 * relevant pillar. Used by the choropleth and the legend.
 */
export const createModeColorScale = (
  mode: MapMode,
  domain: [number, number] = [0, 1]
): d3.ScaleSequential<string> => {
  const baseColor = MAP_MODE_CONFIG[mode].color;
  const lighter = d3.color(baseColor)?.brighter(1.5)?.formatHex() ?? '#ffffff';
  const darker = d3.color(baseColor)?.darker(0.3)?.formatHex() ?? baseColor;
  return d3.scaleSequential().domain(domain).interpolator(d3.interpolateRgb(lighter, darker));
};

/**
 * Categorical scale for the country-typology map mode. Maps cluster 1-5 to the
 * dissertation-aligned cluster colour palette.
 */
export const getClusterColor = (id: ClusterId | null | undefined): string => {
  if (!id) return '#6B7280';
  return CLUSTER_DEFINITIONS.find((c) => c.id === id)?.color ?? '#6B7280';
};

/**
 * Diverging scale used for the sovereignty discount mode and for any
 * Build-minus-Balance gap displays.
 */
export const createDivergingScale = (
  domain: [number, number] = [-0.5, 0.5],
  low = PILLAR_CONFIG.balance.color,
  high = PILLAR_CONFIG.risk.color
): d3.ScaleSequential<string> =>
  d3.scaleSequential().domain(domain).interpolator(d3.interpolateRgb(low, high));

// === Domains ===

export const getDomainForMode = (countries: Country[], mode: MapMode): [number, number] => {
  if (countries.length === 0) return [0, 1];
  // Categorical and bivariate modes don't use a single scalar domain.
  if (mode === 'clusters' || mode === 'bivariate') return [1, 5];
  const values = countries.map((c) =>
    valueForMode(c, mode === 'sovereignty' ? 'sovereignty' : (mode as Exclude<MapMode, 'bivariate' | 'clusters'>))
  );
  return [Math.min(...values), Math.max(...values)];
};

// === Bivariate 3×3 colour matrix (Build × Break) ===

/**
 * Bivariate choropleth colour matrix for the dissertation's Figure 1 / 2 style
 * Build × Break view. 3x3 grid: rows are Build tertiles (low/mid/high), cols are
 * Break-displacement tertiles. Top-right (high Build, high Break) is the
 * highest-concern corner.
 */
export const BIVARIATE_PALETTE: string[][] = [
  ['#e8e8e8', '#ace4e4', '#5ac8c8'], // low Build
  ['#dfb0d6', '#a5add3', '#5698b9'], // mid Build
  ['#be64ac', '#8c62aa', '#3b4994'], // high Build
];

const tertile = (value: number, breaks: [number, number]): 0 | 1 | 2 => {
  if (value < breaks[0]) return 0;
  if (value < breaks[1]) return 1;
  return 2;
};

/** Compute tertile breakpoints for a value array. */
export const tertileBreaks = (values: number[]): [number, number] => {
  if (values.length === 0) return [0.33, 0.66];
  const sorted = [...values].sort((a, b) => a - b);
  return [
    sorted[Math.floor(sorted.length / 3)] ?? 0.33,
    sorted[Math.floor((sorted.length * 2) / 3)] ?? 0.66,
  ];
};

export const bivariateColor = (
  hazard: number,
  displacement: number,
  breaks: { hazard: [number, number]; displacement: [number, number] }
): string => {
  const row = tertile(hazard, breaks.hazard);
  const col = tertile(displacement, breaks.displacement);
  return BIVARIATE_PALETTE[row]?.[col] ?? '#e8e8e8';
};

// === Linear and size scales ===

export const createRadiusScale = (
  domain: [number, number] = [0, 1],
  range: [number, number] = [4, 24]
): d3.ScaleLinear<number, number> => d3.scaleSqrt().domain(domain).range(range);

export const createLinearScale = (
  domain: [number, number],
  range: [number, number]
): d3.ScaleLinear<number, number> => d3.scaleLinear().domain(domain).range(range);

export const createScatterScales = (
  width: number,
  height: number,
  padding = 40
): {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
} => ({
  xScale: d3.scaleLinear().domain([0, 1]).range([padding, width - padding]),
  yScale: d3.scaleLinear().domain([0, 1]).range([height - padding, padding]),
});

// === Formatting ===

export const normalize = (value: number, min: number, max: number): number =>
  max === min ? 0.5 : (value - min) / (max - min);

export const formatScore = (value: number, decimals = 0): string => (value * 100).toFixed(decimals);

export const formatPercentage = (value: number): string => `${formatScore(value)}%`;

export const formatTick = (value: number): string => {
  if (value === 0) return '0';
  if (value === 1) return '100';
  return Math.round(value * 100).toString();
};

export const generateTicks = (min: number, max: number, count = 5): number[] => {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
};

