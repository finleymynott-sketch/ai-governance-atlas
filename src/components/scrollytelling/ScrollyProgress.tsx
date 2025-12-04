import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollySteps, TOTAL_STEPS } from './scrollyConfig';

interface ScrollyProgressProps {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

/**
 * Enhanced progress indicator with connecting line and labels
 * Fixed on left side, vertically centered
 */
export const ScrollyProgress = ({ currentStep, onStepClick }: ScrollyProgressProps) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const progressPercentage = (currentStep / (TOTAL_STEPS - 1)) * 100;

  return (
    <motion.div
      className="fixed left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Container for dots and line */}
      <div className="relative flex flex-col gap-4">
        {/* Background line */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-bg-tertiary rounded-full"
          style={{
            top: '6px',
            bottom: '6px',
          }}
        />
        
        {/* Progress fill line */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-accent-primary rounded-full origin-top"
          style={{
            top: '6px',
            bottom: '6px',
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: progressPercentage / 100 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Dots */}
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const stepConfig = scrollySteps[index];
          const isHovered = hoveredStep === index;

          return (
            <div key={index} className="relative z-10">
              <motion.button
                onClick={() => onStepClick?.(index)}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`
                  relative rounded-full transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                  ${isActive 
                    ? 'bg-accent-primary shadow-lg shadow-accent-primary/40' 
                    : isCompleted
                      ? 'bg-accent-primary/70'
                      : 'bg-bg-tertiary border-2 border-border-subtle hover:border-text-tertiary'
                  }
                `}
                initial={false}
                animate={{
                  width: isActive ? 14 : 10,
                  height: isActive ? 14 : 10,
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                aria-label={`Go to ${stepConfig?.headline || `step ${index + 1}`}`}
              >
                {/* Active dot pulse */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-accent-primary"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Tooltip label on hover */}
              <AnimatePresence>
                {isHovered && stepConfig && (
                  <motion.div
                    className="
                      absolute left-8 top-1/2 -translate-y-1/2
                      px-3 py-1.5 rounded-lg
                      bg-bg-secondary border border-border-subtle
                      shadow-lg whitespace-nowrap
                      pointer-events-none
                    "
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="text-xs font-medium text-text-primary">
                      {stepConfig.headline || `Step ${index + 1}`}
                    </p>
                    {stepConfig.headline && (
                      <p className="text-[10px] text-text-tertiary mt-0.5">
                        {index + 1} of {TOTAL_STEPS}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
