import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtlasStore } from '@/store/useAtlasStore';
import { ScrollySlide } from './ScrollySlide';
import { ScrollyMap } from './ScrollyMap';
import { ScrollyProgress } from './ScrollyProgress';
import { CountryComparisonCard } from './CountryComparisonCard';
import { PillarTitle } from './PillarTitle';
import { ParticleTrail } from './ParticleTrail';
import { FloatingOrbs } from './FloatingOrbs';
import { ParticleBurst } from './ParticleBurst';
import { scrollySteps, TOTAL_STEPS } from './scrollyConfig';
import { PILLAR_CONFIG, MAP_MODE_CONFIG } from '@/types';

interface ScrollytellingSectionProps {
  onComplete: () => void;
}

// Pillar color mapping
const PILLAR_COLORS: Record<string, string> = {
  build: PILLAR_CONFIG.build.color,
  break: PILLAR_CONFIG.break.color,
  balance: PILLAR_CONFIG.balance.color,
  risk: PILLAR_CONFIG.risk.color,
};

/**
 * Slideshow-based scrollytelling container with premium visual effects.
 * Each step is a fullscreen slide with particle trails, glows, and animations.
 */
export const ScrollytellingSection = ({ onComplete }: ScrollytellingSectionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showClickRipple, setShowClickRipple] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const [showParticleTrail, setShowParticleTrail] = useState(false);
  const [particleColor, setParticleColor] = useState('#3B82F6');
  const [showBurst, setShowBurst] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevStepRef = useRef(0);

  const setScrollyStep = useAtlasStore((state) => state.setScrollyStep);
  const completeScrolly = useAtlasStore((state) => state.completeScrolly);
  const theme = useAtlasStore((state) => state.theme);

  // Sync with store
  useEffect(() => {
    setScrollyStep(currentStep);
  }, [currentStep, setScrollyStep]);

  // Handle pillar transitions with particle trail
  useEffect(() => {
    const prevStep = prevStepRef.current;
    const currentConfig = scrollySteps[currentStep];

    const pillarSlides = ['build', 'break', 'balance', 'gap'];
    const isCurrentPillar = pillarSlides.includes(currentConfig?.id ?? '');

    if (isCurrentPillar && currentStep !== prevStep) {
      const mode = currentConfig?.mapState.mapMode;
      const pillar = mode ? MAP_MODE_CONFIG[mode].pillar : null;
      if (pillar && pillar !== 'composite' && pillar !== 'typology' && PILLAR_COLORS[pillar]) {
        setParticleColor(PILLAR_COLORS[pillar]);
        setShowParticleTrail(true);
        setTimeout(() => setShowParticleTrail(false), 1200);
      }
    }

    prevStepRef.current = currentStep;
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= TOTAL_STEPS || isTransitioning) return;
      setIsTransitioning(true);
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [currentStep, isTransitioning]
  );

  const handleComplete = useCallback(() => {
    // Show particle burst
    setShowBurst(true);
    setTimeout(() => {
      completeScrolly();
      onComplete();
    }, 800);
  }, [completeScrolly, onComplete]);

  const goNext = useCallback(() => {
    if (isTransitioning) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setIsTransitioning(true);
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
      setTimeout(() => setIsTransitioning(false), 400);
    } else {
      handleComplete();
    }
  }, [currentStep, isTransitioning, handleComplete]);

  const goPrev = useCallback(() => {
    if (currentStep > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
      setTimeout(() => setIsTransitioning(false), 400);
    }
  }, [currentStep, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          e.preventDefault();
          handleComplete();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, handleComplete]);

  // Click to advance with ripple effect
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[data-no-advance]')
      ) {
        return;
      }

      // Show ripple effect
      setRipplePosition({ x: e.clientX, y: e.clientY });
      setShowClickRipple(true);
      setTimeout(() => setShowClickRipple(false), 600);

      goNext();
    },
    [goNext]
  );

  const currentMapState = scrollySteps[currentStep]?.mapState ?? scrollySteps[0]!.mapState;
  const currentConfig = scrollySteps[currentStep]!;
  const isLastSlide = currentStep === TOTAL_STEPS - 1;
  const isFrameworkSlide = currentConfig.id === 'framework';

  // Get edge glow color based on current pillar.
  const currentPillar = currentMapState.mapMode
    ? MAP_MODE_CONFIG[currentMapState.mapMode].pillar
    : null;
  const edgeGlowColor =
    currentPillar && currentPillar !== 'composite' && currentPillar !== 'typology'
      ? PILLAR_COLORS[currentPillar]
      : null;

  return (
    <div
      className="relative h-[calc(100vh-4rem)] bg-bg-primary overflow-hidden cursor-pointer"
      onClick={handleContainerClick}
    >
      {/* Big pillar title (behind everything) */}
      <PillarTitle
        pillar={currentConfig.showPillarTitle}
        visible={!!currentConfig.showPillarTitle}
      />

      {/* Click ripple effect */}
      <AnimatePresence>
        {showClickRipple && (
          <motion.div
            className="fixed pointer-events-none z-50"
            style={{ left: ripplePosition.x, top: ripplePosition.y }}
            initial={{ scale: 0, opacity: 0.4 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div
              className="w-16 h-16 -ml-8 -mt-8 rounded-full"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle trail effect for pillar transitions */}
      <ParticleTrail
        isActive={showParticleTrail}
        color={particleColor}
        direction={direction > 0 ? 'left-to-right' : 'right-to-left'}
      />

      {/* Particle burst on completion */}
      <ParticleBurst isActive={showBurst} centerX={50} centerY={50} particleCount={60} />

      {/* Progress indicator */}
      <ScrollyProgress currentStep={currentStep} onStepClick={goToStep} />

      {/* Main layout */}
      <div className="flex h-full">
        {/* Left column - text slide */}
        <div className="w-full lg:w-[40%] relative z-10 flex items-center justify-center p-6 md:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <ScrollySlide
              key={currentStep}
              config={currentConfig}
              direction={direction}
              isLast={isLastSlide}
              onExploreClick={handleComplete}
            />
          </AnimatePresence>
        </div>

        {/* Right column - map and overlays */}
        <div className="hidden lg:block w-[60%] h-full relative overflow-hidden">
          {/* Edge glow effect */}
          <AnimatePresence>
            {edgeGlowColor && isTransitioning && (
              <motion.div
                className="absolute inset-y-0 left-0 w-32 pointer-events-none z-10"
                style={{
                  background: `linear-gradient(to right, ${edgeGlowColor}40, transparent)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* The map */}
          <ScrollyMap mapState={currentMapState} />

          {/* Floating orbs for framework intro */}
          <FloatingOrbs isActive={isFrameworkSlide} />

          {/* Country comparison card */}
          {/* Headline demographic-paradox pair from the dissertation. */}
          <CountryComparisonCard
            visible={currentConfig.showComparisonCard}
            countries={['USA', 'JPN']}
            showBreakdown={currentConfig.showComparisonBreakdown}
          />
        </div>
      </div>

      {/* Mobile: Map shown as background */}
      <div className="lg:hidden absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full opacity-15">
          <ScrollyMap mapState={currentMapState} />
        </div>
      </div>

      {/* Navigation hint - only on first slide */}
      <AnimatePresence>
        {currentStep === 0 && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-text-tertiary text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <span>Click anywhere or press</span>
            <motion.kbd
              className="px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary text-xs font-mono"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.kbd>
            <span>to continue</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button */}
      <AnimatePresence>
        {!isLastSlide && (
          <motion.button
            className="
              absolute top-4 right-4 z-40
              px-3 py-1.5 rounded-full
              bg-bg-secondary/60 backdrop-blur-sm
              border border-border-subtle
              text-xs text-text-tertiary
              hover:text-text-secondary hover:border-border-strong
              transition-all duration-200
            "
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            data-no-advance
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            Skip →
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide counter with progress bar and animated number */}
      <div className="absolute bottom-6 right-6 z-20">
        <motion.div
          className="flex flex-col items-end gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Progress bar */}
          <div className="w-20 h-1 bg-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          {/* Animated counter */}
          <div className="flex items-center text-xs font-mono text-text-tertiary opacity-60 hover:opacity-100 transition-opacity">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStep}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep + 1}
              </motion.span>
            </AnimatePresence>
            <span className="mx-0.5">/</span>
            <span>{TOTAL_STEPS}</span>
          </div>
        </motion.div>
      </div>

      {/* Ambient edge glow */}
      <div
        className="absolute inset-y-0 right-0 w-1 pointer-events-none transition-colors duration-500"
        style={{
          backgroundColor: edgeGlowColor ? `${edgeGlowColor}30` : 'transparent',
          boxShadow: edgeGlowColor ? `0 0 20px ${edgeGlowColor}40` : 'none',
        }}
      />
    </div>
  );
};
