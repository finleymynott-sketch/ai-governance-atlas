import { motion, AnimatePresence } from 'framer-motion';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { ActivePillar } from '@/types';
import { PILLAR_CONFIG } from '@/types';

const pillars: ActivePillar[] = ['build', 'break', 'balance', 'risk'];

/**
 * Radio button group for selecting the active pillar
 * Enhanced with premium micro-interactions
 */
export const PillarSelector = () => {
  const activePillar = useAtlasStore((state) => state.activePillar);
  const setActivePillar = useAtlasStore((state) => state.setActivePillar);

  return (
    <div className="space-y-3">
      <h3 className="section-header">
        Colour by Pillar
      </h3>
      
      <div className="space-y-1">
        {pillars.map((pillar) => {
          const config = PILLAR_CONFIG[pillar];
          const isActive = activePillar === pillar;

          return (
            <motion.button
              key={pillar}
              onClick={() => setActivePillar(pillar)}
              className={`
                relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-left cursor-pointer
                transition-colors duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                ${isActive 
                  ? 'text-text-primary' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                }
              `}
              whileTap={{ scale: 0.98 }}
            >
              {/* Colour indicator with glow */}
              <motion.div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: config.color }}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  boxShadow: isActive 
                    ? `0 0 12px ${config.color}` 
                    : '0 0 0px transparent',
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Label */}
              <span className={`
                flex-1 text-sm font-medium transition-colors duration-200
                ${isActive ? 'text-text-primary' : 'text-text-secondary'}
              `}>
                {config.label}
              </span>

              {/* Selection indicator dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-accent-primary"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>

              {/* Active indicator background */}
              {isActive && (
                <motion.div
                  layoutId="pillarActive"
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${config.color} 25%, transparent)`,
                  }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
