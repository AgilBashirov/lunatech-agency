"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { motionTransition } from "@/lib/motion";

/**
 * In-view reveal wrapper.
 *
 * SSR safety: the server and pre-hydration paint both render a plain `<div>`
 * (visible content, no animation). Post-hydration the component swaps to
 * the animated `motion.div` so the reveal can play when the element scrolls
 * into view.
 *
 * Why this pattern over toggling `initial`: mutating `motion.div`'s
 * `initial` prop after mount could produce a one-frame flash on slow
 * hydration — SSR renders at the target, the post-mount re-render flips
 * `initial` to {opacity:0,y:22}, and `whileInView` only resolves to 1 once
 * the viewport observer fires. Swapping the wrapper element entirely at
 * hydration time avoids that path: the unmount/remount happens while
 * content is already painted, so there is no visual gap.
 *
 * `prefers-reduced-motion`: bails to the same plain wrapper — no transform,
 * no opacity transition, content is rendered as-is.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // SSR + first paint + reduced-motion → plain div. Identical DOM to what
  // the server emits, so hydration doesn't reconcile a different element type.
  if (reduce || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...motionTransition.smooth, delay }}
    >
      {children}
    </motion.div>
  );
}
