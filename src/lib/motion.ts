/** Framer Motion / UI timing — micro fast, layout normal, entrances smooth */
export const motionTransition = {
  fast: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  normal: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  /** Softer ease-out for scroll hints, reveals, hover settle */
  smooth: { duration: 0.48, ease: [0.16, 1, 0.3, 1] as const },
  spring: { type: "spring" as const, stiffness: 320, damping: 32 },
};
