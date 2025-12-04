import { motion, AnimatePresence } from 'framer-motion';

interface PillarTitleProps {
  pillar: 'build' | 'break' | 'balance' | null;
  visible: boolean;
}

const pillarConfig = {
  build: {
    label: 'BUILD',
    color: '#F59E0B',
  },
  break: {
    label: 'BREAK',
    color: '#EF4444',
  },
  balance: {
    label: 'BALANCE',
    color: '#10B981',
  },
};

/**
 * Large background text showing the pillar name.
 * Appears semi-transparent behind other content for dramatic effect.
 */
export const PillarTitle = ({ pillar, visible }: PillarTitleProps) => {
  if (!pillar) return null;

  const config = pillarConfig[pillar];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h1
            className="text-[10rem] sm:text-[14rem] md:text-[18rem] lg:text-[22rem] font-black tracking-tighter select-none"
            style={{
              color: config.color,
              opacity: 0.12,
              textShadow: `0 0 100px ${config.color}40, 0 0 200px ${config.color}20`,
              lineHeight: 0.85,
            }}
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {config.label}
          </motion.h1>

          {/* Subtle animated glow behind the text */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${config.color}15 0%, transparent 60%)`,
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PillarTitle;


