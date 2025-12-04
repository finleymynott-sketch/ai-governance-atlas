import * as d3 from 'd3';
import type { Country, ActivePillar } from '@/types';

// === Color Scales ===

/** Pillar color mapping */
export const PILLAR_COLORS: Record<ActivePillar, string> = {
  build: '#F59E0B',
  break: '#EF4444',
  balance: '#10B981',
  risk: '#8B5CF6',
};

/** Get the CSS variable for a pillar color */
export const getPillarCSSVar = (pillar: ActivePillar): string => {
  return `var(--color-${pillar})`;
};

/**
 * Create a sequential color scale for a pillar
 * Light colors for low values, saturated colors for high values
 */
export const createPillarColorScale = (
  pillar: ActivePillar,
  domain: [number, number] = [0, 1]
): d3.ScaleSequential<string> => {
  const baseColor = PILLAR_COLORS[pillar];
  
  // Create a custom interpolator from light to saturated
  const lighterColor = d3.color(baseColor)?.brighter(1.5)?.formatHex() ?? '#ffffff';
  const darkerColor = d3.color(baseColor)?.darker(0.3)?.formatHex() ?? baseColor;
  
  return d3
    .scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateRgb(lighterColor, darkerColor));
};

/**
 * Create a diverging color scale for risk imbalance
 * Green (negative/good) -> Neutral -> Purple (positive/risky)
 */
export const createRiskDivergingScale = (
  domain: [number, number] = [-0.5, 0.5]
): d3.ScaleSequential<string> => {
  return d3
    .scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateRgb('#10B981', '#8B5CF6'));
};

// === Size Scales ===

/**
 * Create a radius scale for bubble/circle visualizations
 */
export const createRadiusScale = (
  domain: [number, number] = [0, 1],
  range: [number, number] = [4, 24]
): d3.ScaleLinear<number, number> => {
  return d3.scaleSqrt().domain(domain).range(range);
};

/**
 * Create a linear scale
 */
export const createLinearScale = (
  domain: [number, number],
  range: [number, number]
): d3.ScaleLinear<number, number> => {
  return d3.scaleLinear().domain(domain).range(range);
};

// === Position Scales ===

/**
 * Create X/Y scales for scatter plot based on container dimensions
 */
export const createScatterScales = (
  width: number,
  height: number,
  padding = 40
): {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
} => {
  return {
    xScale: d3.scaleLinear().domain([0, 1]).range([padding, width - padding]),
    yScale: d3.scaleLinear().domain([0, 1]).range([height - padding, padding]),
  };
};

// === Data Processing ===

/**
 * Get the domain (min/max) for a specific pillar across countries
 */
export const getPillarDomain = (
  countries: Country[],
  pillar: 'build' | 'break' | 'balance'
): [number, number] => {
  if (countries.length === 0) return [0, 1];
  
  const values = countries.map((c) => c[pillar].overall);
  return [Math.min(...values), Math.max(...values)];
};

/**
 * Get the domain for risk imbalance
 */
export const getRiskDomain = (countries: Country[]): [number, number] => {
  if (countries.length === 0) return [-0.5, 0.5];
  
  const values = countries.map((c) => c.riskImbalance);
  const absMax = Math.max(Math.abs(Math.min(...values)), Math.abs(Math.max(...values)));
  return [-absMax, absMax];
};

/**
 * Normalize a value to 0-1 range
 */
export const normalize = (
  value: number,
  min: number,
  max: number
): number => {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
};

/**
 * Format a score value for display (0-100 with optional decimal)
 */
export const formatScore = (value: number, decimals = 0): string => {
  return (value * 100).toFixed(decimals);
};

/**
 * Format a score as a percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${formatScore(value, 0)}%`;
};

/**
 * Get a color for a value using a pillar's color scale
 */
export const getColorForValue = (
  value: number,
  pillar: ActivePillar
): string => {
  const scale = createPillarColorScale(pillar);
  return scale(value);
};

// === Cluster Colors ===

export const CLUSTER_COLORS: Record<string, string> = {
  'high-build-low-balance': '#EF4444',
  'balanced-high': '#10B981',
  'balanced-low': '#6B7280',
  'low-build-high-balance': '#3B82F6',
  'emerging': '#F59E0B',
};

/**
 * Get the color for a cluster
 */
export const getClusterColor = (clusterId: string): string => {
  return CLUSTER_COLORS[clusterId] ?? '#6B7280';
};

// === Axis Helpers ===

/**
 * Generate nice tick values for an axis
 */
export const generateTicks = (
  min: number,
  max: number,
  count = 5
): number[] => {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
};

/**
 * Format tick value for display
 */
export const formatTick = (value: number): string => {
  if (value === 0) return '0';
  if (value === 1) return '100';
  return Math.round(value * 100).toString();
};

