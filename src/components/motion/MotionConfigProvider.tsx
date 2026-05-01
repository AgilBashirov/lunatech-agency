"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Site-wide framer-motion configuration. With `reducedMotion="user"`, every
 * `<motion.*>` component inside automatically respects the user's
 * `prefers-reduced-motion` setting — animation is suppressed, transforms are
 * dropped, opacity stays at the resting value. Individual components may
 * still call `useReducedMotion()` for custom branching when the default
 * behavior isn't enough (e.g. swapping a motion element for a plain div).
 */
export function MotionConfigProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
