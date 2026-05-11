/**
 * Sequential colour ramps used by the choropleth and legend. Each map mode
 * maps onto one of the four pillar palettes (Build amber, Break red, Balance
 * green, Risk purple) plus a couple of specials.
 */
import type { MapMode } from '@/types';

export const PILLAR_COLORS = {
  build: '#F59E0B',
  break: '#EF4444',
  balance: '#10B981',
  risk: '#8B5CF6',
} as const;

const BUILD_RAMP_DARK = ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B'] as const;
const BREAK_RAMP_DARK = ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444'] as const;
const BALANCE_RAMP_DARK = ['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981'] as const;
const RISK_RAMP_DARK = ['#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6'] as const;

const BUILD_RAMP_LIGHT = ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706'] as const;
const BREAK_RAMP_LIGHT = ['#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626'] as const;
const BALANCE_RAMP_LIGHT = ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669'] as const;
const RISK_RAMP_LIGHT = ['#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED'] as const;

/**
 * Diverging scale for sovereignty (and any Build-minus-Balance gap display).
 * Green = governance-strong, neutral, purple = risk-leaning.
 */
export const DIVERGING_SCALE = ['#10B981', '#6EE7B7', '#737373', '#FCA5A5', '#EF4444'] as const;

export const PILLAR_SCALES_DARK = {
  build: BUILD_RAMP_DARK,
  break: BREAK_RAMP_DARK,
  balance: BALANCE_RAMP_DARK,
  risk: RISK_RAMP_DARK,
} as const;

export const PILLAR_SCALES_LIGHT = {
  build: BUILD_RAMP_LIGHT,
  break: BREAK_RAMP_LIGHT,
  balance: BALANCE_RAMP_LIGHT,
  risk: RISK_RAMP_LIGHT,
} as const;

/**
 * Returns the appropriate colour ramp for a given map mode and theme.
 * Categorical (clusters) and bivariate modes return the build ramp as a
 * placeholder — callers should special-case those modes upstream.
 */
export const getRampForMode = (
  mode: MapMode,
  isDark: boolean
): readonly string[] => {
  const dark = isDark ? PILLAR_SCALES_DARK : PILLAR_SCALES_LIGHT;
  switch (mode) {
    case 'hazard':
    case 'build-supply':
    case 'build-access':
      return dark.build;
    case 'break-displacement':
    case 'break-shortage':
      return dark.break;
    case 'balance':
    case 'sovereignty':
      return dark.balance;
    case 'risk':
      return dark.risk;
    case 'clusters':
    case 'bivariate':
      return dark.risk; // upstream handles colouring; this is a fallback only
  }
};

/** CSS gradient string for the colour bar legend. */
export const gradientForMode = (mode: MapMode, isDark: boolean): string => {
  const ramp = getRampForMode(mode, isDark);
  return `linear-gradient(to right, ${ramp.join(', ')})`;
};

export type PillarScaleKey = 'build' | 'break' | 'balance' | 'risk';
