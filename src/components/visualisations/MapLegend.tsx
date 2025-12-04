import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ActivePillar } from '@/types';
import { PILLAR_CONFIG } from '@/types';

interface MapLegendProps {
  activePillar: ActivePillar;
  className?: string;
}

/** CSS gradient strings for each pillar */
const GRADIENTS: Record<ActivePillar, string> = {
  build: 'linear-gradient(to right, #FEF3C7, #FDE68A, #FCD34D, #FBBF24, #F59E0B)',
  break: 'linear-gradient(to right, #FEE2E2, #FECACA, #FCA5A5, #F87171, #EF4444)',
  balance: 'linear-gradient(to right, #D1FAE5, #A7F3D0, #6EE7B7, #34D399, #10B981)',
  risk: 'linear-gradient(to right, #10B981, #737373, #EF4444)',
};

/** Pillar descriptions */
const PILLAR_DESCRIPTIONS: Record<ActivePillar, string> = {
  build: 'AI capability and infrastructure capacity',
  break: 'Labour market exposure to AI disruption',
  balance: 'Governance and regulatory readiness',
  risk: 'Gap between capability and governance',
};

/** All pillar keys for rendering */
const ALL_PILLARS: ActivePillar[] = ['build', 'break', 'balance', 'risk'];

/**
 * Horizontal colour legend showing the current pillar's scale
 * Uses fill-from-left animation when switching pillars
 */
export const MapLegend = ({ activePillar, className = '' }: MapLegendProps) => {
  const pillarConfig = PILLAR_CONFIG[activePillar];
  const isRisk = activePillar === 'risk';

  // State for fill animation
  const [fillWidth, setFillWidth] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset and animate when pillar changes
  useEffect(() => {
    // Reset to 0 width instantly
    setIsAnimating(false);
    setFillWidth(0);
    
    // After a tiny delay, animate to 100%
    const timeout = setTimeout(() => {
      setIsAnimating(true);
      setFillWidth(100);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [activePillar]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`
        inline-flex flex-col items-center gap-3 
        px-6 py-4 rounded-2xl
        bg-bg-secondary/90 backdrop-blur-xl
        border border-border-subtle
        floating-card
        ${className}
      `}
    >
      {/* Pillar indicator with glow */}
      <div className="flex items-center justify-center gap-2.5">
        <motion.div
          key={activePillar}
          className="w-2.5 h-2.5 rounded-full"
          style={{ 
            backgroundColor: pillarConfig.color,
            boxShadow: `0 0 10px ${pillarConfig.color}`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.span 
          key={`label-${activePillar}`}
          className="text-sm font-semibold text-text-primary tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {pillarConfig.label}
        </motion.span>
      </div>

      {/* Gradient bar with labels */}
      <div className="flex flex-col items-center gap-1">
        {/* End labels for risk mode - with fade */}
        <div 
          className="flex justify-between w-full text-[10px] text-text-tertiary mb-1 transition-opacity duration-500"
          style={{ opacity: isRisk ? 1 : 0, height: isRisk ? 'auto' : 0 }}
        >
          <span>Governance Surplus</span>
          <span>Governance Deficit</span>
        </div>

        {/* Gradient bar with glow effect */}
        <div className="relative">
          <div
            className="relative h-3 w-64 rounded-full overflow-hidden bg-black/30"
            style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}
          >
            {/* Animated fill bar with inner highlight */}
            <div
              className="h-full rounded-full"
              style={{ 
                width: `${fillWidth}%`,
                background: GRADIENTS[activePillar],
                boxShadow: `inset 0 1px 2px rgba(255,255,255,0.2), 0 0 10px ${pillarConfig.color}30`,
                transition: isAnimating ? 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              }}
            />
          </div>

          {/* Tick marks */}
          <div className="absolute inset-x-0 -bottom-1.5">
            {(isRisk ? [0, 50, 100] : [0, 25, 50, 75, 100]).map((pos) => (
              <div
                key={pos}
                className="absolute flex flex-col items-center"
                style={{ 
                  left: `${pos}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div 
                  className="w-px h-1.5" 
                  style={{ backgroundColor: 'var(--text-tertiary)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tick labels - crossfade between risk and standard */}
        <div className="relative w-64 mt-2 h-4">
          {/* Standard tick labels (0-100) */}
          <div 
            className="absolute inset-0 flex justify-between text-[11px] text-text-tertiary data-value transition-opacity duration-500"
            style={{ opacity: isRisk ? 0 : 1 }}
          >
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          
          {/* Risk tick labels (-50 to +50) */}
          <div 
            className="absolute inset-0 flex justify-between text-[11px] text-text-tertiary data-value transition-opacity duration-500"
            style={{ opacity: isRisk ? 1 : 0 }}
          >
            <span>−50</span>
            <span className="flex-1 text-center">0</span>
            <span>+50</span>
          </div>
        </div>
      </div>

      {/* Description - crossfade */}
      <div className="relative h-8 w-[260px]">
        {ALL_PILLARS.map((pillar) => (
          <p 
            key={`desc-${pillar}`}
            className="absolute inset-0 text-xs text-text-secondary text-center leading-relaxed transition-opacity duration-500"
            style={{ opacity: activePillar === pillar ? 1 : 0 }}
          >
            {PILLAR_DESCRIPTIONS[pillar]}
          </p>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Get the color for a value based on the active pillar
 */
export const getColorForValue = (
  value: number,
  pillar: ActivePillar,
  isDark = true
): string => {
  const PILLAR_SCALES_DARK: Record<Exclude<ActivePillar, 'risk'>, string[]> = {
    build: ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B'],
    break: ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444'],
    balance: ['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981'],
  };

  const PILLAR_SCALES_LIGHT: Record<Exclude<ActivePillar, 'risk'>, string[]> = {
    build: ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706'],
    break: ['#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626'],
    balance: ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669'],
  };

  const RISK_SCALE = ['#10B981', '#6EE7B7', '#9CA3AF', '#FCA5A5', '#EF4444'];
  const pillarScales = isDark ? PILLAR_SCALES_DARK : PILLAR_SCALES_LIGHT;
  
  if (pillar === 'risk') {
    const normalized = Math.max(-0.5, Math.min(0.5, value));
    const index = Math.floor(((normalized + 0.5) / 1) * (RISK_SCALE.length - 1));
    return RISK_SCALE[Math.min(index, RISK_SCALE.length - 1)] ?? RISK_SCALE[2]!;
  }

  const colors = pillarScales[pillar];
  const normalized = Math.max(0, Math.min(1, value));
  const index = Math.floor(normalized * (colors.length - 1));
  return colors[Math.min(index, colors.length - 1)] ?? colors[2]!;
};
