import { motion, AnimatePresence } from 'framer-motion';
import { PILLAR_CONFIG } from '@/types';

interface FloatingOrbsProps {
  isActive: boolean;
  highlightedPillar?: 'build' | 'break' | 'balance' | null;
}

interface OrbConfig {
  id: 'build' | 'break' | 'balance';
  color: string;
  position: { top: string; left: string };
  delay: number;
}

const ORB_CONFIGS: OrbConfig[] = [
  {
    id: 'build',
    color: PILLAR_CONFIG.build.color,
    position: { top: '25%', left: '30%' },
    delay: 0,
  },
  {
    id: 'break',
    color: PILLAR_CONFIG.break.color,
    position: { top: '60%', left: '20%' },
    delay: 0.3,
  },
  {
    id: 'balance',
    color: PILLAR_CONFIG.balance.color,
    position: { top: '45%', left: '55%' },
    delay: 0.6,
  },
];

/**
 * Individual floating orb with ambient animation
 */
const FloatingOrb = ({
  config,
  isActive,
  isHighlighted,
}: {
  config: OrbConfig;
  isActive: boolean;
  isHighlighted: boolean;
}) => {
  const { color, position, delay } = config;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ ...position }}
      initial={{ opacity: 0, scale: 0 }}
      animate={
        isActive
          ? {
              opacity: 1,
              scale: 1,
              y: [0, -15, 0, 15, 0],
            }
          : { opacity: 0, scale: 0 }
      }
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: {
          duration: 6,
          delay: delay + 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: isHighlighted ? 100 : 80,
          height: isHighlighted ? 100 : 80,
          marginLeft: isHighlighted ? -50 : -40,
          marginTop: isHighlighted ? -50 : -40,
          background: `radial-gradient(circle, ${color}30, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: isHighlighted ? 48 : 36,
          height: isHighlighted ? 48 : 36,
          marginLeft: isHighlighted ? -24 : -18,
          marginTop: isHighlighted ? -24 : -18,
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}90)`,
          boxShadow: `
            0 0 20px ${color}80,
            0 0 40px ${color}50,
            0 0 60px ${color}30,
            inset 0 0 20px rgba(255, 255, 255, 0.2)
          `,
        }}
        animate={{
          scale: isHighlighted ? [1, 1.1, 1] : [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner shine */}
      <div
        className="absolute rounded-full"
        style={{
          width: isHighlighted ? 16 : 12,
          height: isHighlighted ? 16 : 12,
          marginLeft: isHighlighted ? -16 : -12,
          marginTop: isHighlighted ? -18 : -14,
          background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)',
          filter: 'blur(2px)',
        }}
      />

      {/* Label */}
      <motion.span
        className="absolute text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
        style={{
          color,
          top: isHighlighted ? 40 : 30,
          left: '50%',
          transform: 'translateX(-50%)',
          textShadow: `0 0 10px ${color}`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? (isHighlighted ? 1 : 0.6) : 0 }}
        transition={{ delay: delay + 0.8 }}
      >
        {config.id.charAt(0).toUpperCase() + config.id.slice(1)}
      </motion.span>
    </motion.div>
  );
};

/**
 * Floating orbs representing the three pillars.
 * Used on the "Three dimensions. No aggregation." slide.
 */
export const FloatingOrbs = ({ isActive, highlightedPillar }: FloatingOrbsProps) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {ORB_CONFIGS.map((config) => (
            <FloatingOrb
              key={config.id}
              config={config}
              isActive={isActive}
              isHighlighted={highlightedPillar === config.id}
            />
          ))}

          {/* Connecting lines between orbs (subtle) */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <motion.line
              x1="30%"
              y1="25%"
              x2="20%"
              y2="60%"
              stroke={PILLAR_CONFIG.build.color}
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
            <motion.line
              x1="20%"
              y1="60%"
              x2="55%"
              y2="45%"
              stroke={PILLAR_CONFIG.break.color}
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1.3 }}
            />
            <motion.line
              x1="55%"
              y1="45%"
              x2="30%"
              y2="25%"
              stroke={PILLAR_CONFIG.balance.color}
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1.6 }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

