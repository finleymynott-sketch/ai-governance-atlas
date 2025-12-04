import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TypedHeadline } from './TypedHeadline';
import type { ScrollyStepConfig } from './scrollyConfig';

interface ScrollySlideProps {
  config: ScrollyStepConfig;
  direction: number; // 1 = forward, -1 = backward
  isLast?: boolean;
  onExploreClick?: () => void;
}

// Animation variants for the slide container
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// Get pillar-specific styling with glow
const getPillarStyles = (id: string) => {
  switch (id) {
    case 'build':
      return {
        textColor: 'text-pillar-build',
        bgGlow: 'bg-pillar-build/10',
        orbColor: 'bg-pillar-build',
        glowColor: '#F59E0B',
        accentColor: '#F59E0B',
      };
    case 'break':
      return {
        textColor: 'text-pillar-break',
        bgGlow: 'bg-pillar-break/10',
        orbColor: 'bg-pillar-break',
        glowColor: '#EF4444',
        accentColor: '#EF4444',
      };
    case 'balance':
      return {
        textColor: 'text-pillar-balance',
        bgGlow: 'bg-pillar-balance/10',
        orbColor: 'bg-pillar-balance',
        glowColor: '#10B981',
        accentColor: '#10B981',
      };
    case 'gap':
    case 'patterns':
      return {
        textColor: 'text-pillar-risk',
        bgGlow: 'bg-pillar-risk/10',
        orbColor: 'bg-pillar-risk',
        glowColor: '#8B5CF6',
        accentColor: '#8B5CF6',
      };
    default:
      return {
        textColor: 'text-text-primary',
        bgGlow: '',
        orbColor: '',
        glowColor: '#3B82F6',
        accentColor: '#3B82F6',
      };
  }
};

/**
 * Individual slide for the slideshow-based scrollytelling.
 * Features typed headlines with glow effects and smooth animations.
 */
export const ScrollySlide = ({
  config,
  direction,
  isLast = false,
  onExploreClick,
}: ScrollySlideProps) => {
  const { headline, body, id } = config;
  const [headlineComplete, setHeadlineComplete] = useState(false);
  const styles = getPillarStyles(id);
  const isPillarSlide = ['build', 'break', 'balance', 'gap'].includes(id);

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="max-w-md w-full"
    >
      <div
        className={`
          relative p-8 rounded-2xl
          bg-black/60 backdrop-blur-md
          border border-white/10
          shadow-2xl overflow-hidden
        `}
      >
        {/* Accent line on left */}
        <motion.div
          className="absolute left-0 top-6 bottom-6 w-1 rounded-full"
          style={{
            backgroundColor: styles.accentColor,
            boxShadow: `0 0 15px ${styles.accentColor}60`,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* Pillar glow background */}
        {isPillarSlide && (
          <>
            <motion.div
              className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${styles.bgGlow}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <motion.div
              className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl ${styles.bgGlow}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </>
        )}

        {/* Content with left padding for accent line */}
        <div className="pl-5">
          {/* Pillar orb indicator */}
          {isPillarSlide && (
            <motion.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${styles.orbColor}`}
                style={{
                  boxShadow: `0 0 8px ${styles.glowColor}, 0 0 16px ${styles.glowColor}50`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    `0 0 8px ${styles.glowColor}, 0 0 16px ${styles.glowColor}50`,
                    `0 0 12px ${styles.glowColor}, 0 0 24px ${styles.glowColor}80`,
                    `0 0 8px ${styles.glowColor}, 0 0 16px ${styles.glowColor}50`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${styles.textColor}`}
                style={{
                  textShadow: `0 0 8px ${styles.glowColor}40`,
                }}
              >
                {id === 'gap' ? 'Risk Imbalance' : id.charAt(0).toUpperCase() + id.slice(1)}
              </span>
            </motion.div>
          )}

          {/* Headline - typed effect for pillar slides with glow */}
          {headline &&
            (isPillarSlide ? (
              <div className="relative">
                <TypedHeadline
                  text={headline}
                  isActive={true}
                  className={`text-3xl font-bold mb-4 leading-tight ${styles.textColor}`}
                  onComplete={() => setHeadlineComplete(true)}
                  typingSpeed={40}
                />
                {/* Glow effect behind headline */}
                <motion.div
                  className="absolute inset-0 -z-10 blur-xl"
                  style={{ backgroundColor: `${styles.glowColor}15` }}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            ) : (
              <motion.h2
                className="text-3xl font-bold mb-4 leading-tight text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                style={
                  headline.includes('?')
                    ? { textShadow: '0 0 25px rgba(59, 130, 246, 0.25)' }
                    : {}
                }
              >
                {headline}
              </motion.h2>
            ))}

          {/* Body text - fades in after headline */}
          {body && (
            <motion.p
              className="text-lg text-white/80 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isPillarSlide ? (headlineComplete ? 1 : 0) : 1,
                y: 0,
              }}
              transition={{ duration: 0.4, delay: isPillarSlide ? 0 : 0.25 }}
            >
              {body}
            </motion.p>
          )}

          {/* CTA button on last slide */}
          {isLast && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onExploreClick?.();
                }}
                data-no-advance
                className="
                  relative w-full py-4 px-6 rounded-xl
                  bg-gradient-to-r from-blue-500 to-blue-600
                  hover:from-blue-600 hover:to-blue-700
                  text-white font-semibold text-lg
                  shadow-lg shadow-blue-500/25
                  active:scale-[0.98]
                  transition-all duration-200
                  overflow-hidden
                  flex items-center justify-center gap-3
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button shine animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
                <span className="relative z-10">Start Exploring</span>
                <ArrowRight className="relative z-10 w-5 h-5" />
              </motion.button>

              {/* Pulsing glow under button */}
              <motion.div
                className="mt-2 mx-auto w-3/4 h-4 rounded-full bg-blue-500/20 blur-xl"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Pillar indicator dots */}
      {isPillarSlide && (
        <motion.div
          className="flex justify-center mt-6 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {['build', 'break', 'balance', 'gap'].map((pillar) => {
            const isActive = id === pillar;
            const pillarColor =
              pillar === 'build'
                ? '#F59E0B'
                : pillar === 'break'
                ? '#EF4444'
                : pillar === 'balance'
                ? '#10B981'
                : '#8B5CF6';

            return (
              <motion.div
                key={pillar}
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: isActive ? pillarColor : 'rgba(255,255,255,0.2)',
                  boxShadow: isActive ? `0 0 8px ${pillarColor}` : 'none',
                }}
                animate={isActive ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.5 }}
              />
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};
