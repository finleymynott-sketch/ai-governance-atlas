import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PILLAR_CONFIG } from '@/types';

interface ParticleBurstProps {
  isActive: boolean;
  centerX?: number;
  centerY?: number;
  particleCount?: number;
  onComplete?: () => void;
}

const PILLAR_COLORS = [
  PILLAR_CONFIG.build.color,
  PILLAR_CONFIG.break.color,
  PILLAR_CONFIG.balance.color,
];

interface BurstParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

/**
 * Celebratory particle burst effect.
 * Used when completing the story and transitioning to Explore mode.
 */
export const ParticleBurst = ({
  isActive,
  centerX = 50,
  centerY = 50,
  particleCount = 60,
  onComplete,
}: ParticleBurstProps) => {
  // Generate particle configurations
  const particles = useMemo<BurstParticle[]>(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.3;
      const baseDistance = 150 + Math.random() * 250;
      
      return {
        id: i,
        angle,
        distance: baseDistance,
        size: Math.random() * 6 + 3,
        color: PILLAR_COLORS[i % 3]!,
        delay: Math.random() * 0.15,
        duration: 0.6 + Math.random() * 0.4,
      };
    });
  }, [particleCount]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isActive && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          {/* Central flash */}
          <motion.div
            className="absolute rounded-full"
            style={{
              left: `${centerX}%`,
              top: `${centerY}%`,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)',
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                left: `${centerX}%`,
                top: `${centerY}%`,
                marginLeft: -particle.size / 2,
                marginTop: -particle.size / 2,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos(particle.angle) * particle.distance,
                y: Math.sin(particle.angle) * particle.distance,
                scale: [0, 1.5, 0.5],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}

          {/* Ring burst */}
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border-2"
              style={{
                left: `${centerX}%`,
                top: `${centerY}%`,
                borderColor: PILLAR_COLORS[ring],
                width: 10,
                height: 10,
                marginLeft: -5,
                marginTop: -5,
              }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 30 + ring * 10, opacity: 0 }}
              transition={{
                duration: 0.8,
                delay: ring * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Smaller particle spray effect for UI elements like progress bars
 */
export const ParticleSpray = ({
  isActive,
  color,
  originX = 0,
  originY = 0,
  particleCount = 8,
  direction = 'right',
}: {
  isActive: boolean;
  color: string;
  originX?: number;
  originY?: number;
  particleCount?: number;
  direction?: 'right' | 'left' | 'up' | 'down';
}) => {
  const particles = useMemo(() => {
    const baseAngle = {
      right: 0,
      left: Math.PI,
      up: -Math.PI / 2,
      down: Math.PI / 2,
    }[direction];

    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      angle: baseAngle + (Math.random() - 0.5) * (Math.PI / 3),
      distance: 15 + Math.random() * 25,
      size: Math.random() * 3 + 1,
      delay: i * 0.02,
    }));
  }, [particleCount, direction]);

  return (
    <AnimatePresence>
      {isActive && (
        <div
          className="absolute pointer-events-none"
          style={{ left: originX, top: originY }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: color,
                boxShadow: `0 0 ${particle.size * 2}px ${color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(particle.angle) * particle.distance,
                y: Math.sin(particle.angle) * particle.distance,
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 0.4,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

