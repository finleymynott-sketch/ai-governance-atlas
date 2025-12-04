import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleTrailProps {
  isActive: boolean;
  color: string;
  direction?: 'left-to-right' | 'right-to-left' | 'radial';
  particleCount?: number;
}

/**
 * Particle trail effect for pillar transitions.
 * Creates a wave of particles flowing across the screen.
 */
export const ParticleTrail = ({
  isActive,
  color,
  direction = 'left-to-right',
  particleCount = 40,
}: ParticleTrailProps) => {
  // Generate particle configurations once
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      delay: i * 0.025,
      y: Math.random() * 100, // Percentage of container height
      size: Math.random() * 4 + 2,
      yOffset: (Math.random() - 0.5) * 60,
    }));
  }, [particleCount]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {particles.map((particle) => {
            const isReverse = direction === 'right-to-left';
            const startX = isReverse ? '110%' : '-5%';
            const endX = isReverse ? '-5%' : '110%';

            return (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: color,
                  filter: 'blur(1px)',
                  boxShadow: `0 0 ${particle.size * 2}px ${color}`,
                  top: `${particle.y}%`,
                }}
                initial={{ left: startX, opacity: 0, scale: 0 }}
                animate={{
                  left: endX,
                  opacity: [0, 0.9, 0.9, 0],
                  scale: [0, 1, 1, 0],
                  y: particle.yOffset,
                }}
                transition={{
                  duration: 1,
                  delay: particle.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Radial particle burst effect
 */
export const RadialParticles = ({
  isActive,
  color,
  particleCount = 30,
  centerX = 50,
  centerY = 50,
}: {
  isActive: boolean;
  color: string;
  particleCount?: number;
  centerX?: number;
  centerY?: number;
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      return {
        id: i,
        angle,
        distance,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 0.3,
      };
    });
  }, [particleCount]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: color,
                filter: 'blur(1px)',
                boxShadow: `0 0 ${particle.size * 2}px ${color}`,
                left: `${centerX}%`,
                top: `${centerY}%`,
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: Math.cos(particle.angle) * particle.distance,
                y: Math.sin(particle.angle) * particle.distance,
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 0.8,
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

