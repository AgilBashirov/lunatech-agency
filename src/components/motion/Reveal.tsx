"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { motionTransition } from "@/lib/motion";

/**
 * Scroll-reveal wrapper tuned for a calm, premium feel:
 *  • content stays visually present (opacity 1) for SSR / no-JS / a11y —
 *    we only animate a small translate on entry
 *  • small y delta (14px) reads as "settle" rather than "fly in"
 *  • viewport trigger fires slightly before the element enters fully so the
 *    motion completes naturally in the scroll path (no popping after it stops)
 */
export function Reveal({
  children,
  delay = 0,
  className,
  /** Override the translate-y delta (px). Defaults to 14. */
  distance = 14,
}: {
  children: ReactNode;
  delay?: number;
  classNa