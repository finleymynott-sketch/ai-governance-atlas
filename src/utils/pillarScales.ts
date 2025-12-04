/**
 * Shared color scales for pillar visualizations
 */

/** Pillar colors (single color per pillar) */
export const PILLAR_COLORS = {
  build: '#F59E0B',
  break: '#EF4444',
  balance: '#10B981',
  risk: '#8B5CF6',
} as const;

/** Sequential color scales for pillars (dark theme) */
export const PILLAR_SCALES_DARK = {
  build: ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B'] as const,
  break: ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444'] as const,
  balance: ['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981'] as const,
} as const;

/** Sequential color scales for pillars (light theme - more saturated) */
export const PILLAR_SCALES_LIGHT = {
  build: ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706'] as const,
  break: ['#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626'] as const,
  balance: ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669'] as const,
} as const;

/** Diverging scale for risk imbalance */
export const RISK_SCALE = ['#10B981', '#6EE7B7', '#737373', '#FCA5A5', '#EF4444'] as const;

/** Type for pillar scale keys */
export type PillarScaleKey = 'build' | 'break' | 'balance';


