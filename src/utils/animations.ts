/**
 * Shared animation timing, easing, and Framer Motion variants
 * For consistent micro-interactions across the application
 */

// Timing constants (milliseconds)
export const TIMING = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

// CSS easing functions
export const EASING = {
  /** Standard easing - good for most transitions */
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Enter - starts slow, ends fast (for elements appearing) */
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Exit - starts fast, ends slow (for elements leaving) */
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Bounce - slight overshoot for playful feel */
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Smooth - very gentle, no acceleration */
  smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

// Framer Motion spring configs
export const SPRING = {
  /** Snappy - quick response, slight bounce */
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  /** Gentle - slower, smoother */
  gentle: { type: 'spring', stiffness: 200, damping: 25 },
  /** Bouncy - noticeable overshoot */
  bouncy: { type: 'spring', stiffness: 300, damping: 20 },
  /** Stiff - minimal overshoot */
  stiff: { type: 'spring', stiffness: 500, damping: 35 },
} as const;

// === Framer Motion Variants ===

/** Simple fade in/out */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Slide in from right */
export const slideInRight = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

/** Slide in from left */
export const slideInLeft = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

/** Slide in from bottom */
export const slideInUp = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -10, opacity: 0 },
};

/** Slide in from top */
export const slideInDown = {
  initial: { y: -10, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 10, opacity: 0 },
};

/** Scale in */
export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

/** Pop in with slight overshoot */
export const popIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: SPRING.bouncy,
  },
  exit: { scale: 0.8, opacity: 0 },
};

// === Stagger Animations ===

/** Container that staggers children */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

/** Fast stagger for lists */
export const staggerContainerFast = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

/** Individual stagger item */
export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: { opacity: 0, y: -10 },
};

/** Stagger item sliding from right */
export const staggerItemRight = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: { opacity: 0, x: 20 },
};

// === Panel Animations ===

/** Side panel sliding in from right */
export const panelSlideRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: { 
    x: '100%', 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/** Sidebar sliding in from left */
export const panelSlideLeft = {
  initial: { x: '-100%', opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { 
    x: '-100%', 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// === Bar/Progress Animations ===

/** Bar that fills from left with overshoot */
export const barFill = {
  initial: { width: 0 },
  animate: (value: number) => ({
    width: `${value}%`,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1], // Slight overshoot
      delay: 0.2,
    },
  }),
};

// === Tooltip/Dropdown Animations ===

/** Tooltip appearing */
export const tooltipVariants = {
  initial: { opacity: 0, scale: 0.95, y: 5 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 5 },
};

/** Dropdown menu */
export const dropdownVariants = {
  initial: { opacity: 0, y: -10, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.15,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// === Utility Functions ===

/** Get transition delay based on index for staggered effects */
export const getStaggerDelay = (index: number, baseDelay = 0.03): number => {
  return index * baseDelay;
};

/** Create a transition object with custom duration and easing */
export const createTransition = (
  duration: number = TIMING.normal,
  easing: string = EASING.default
) => ({
  duration: duration / 1000, // Convert ms to seconds for Framer Motion
  ease: easing.match(/[\d.]+/g)?.map(Number) || [0.4, 0, 0.2, 1],
});


