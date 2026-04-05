/** Framer Motion / UI timing — design spec: 150–250ms micro, ~300ms layout */
export const motionTransition = {
  fast: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  normal: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  spring: { type: "spring" as const, stiffness: 380, damping: 28 },
};
