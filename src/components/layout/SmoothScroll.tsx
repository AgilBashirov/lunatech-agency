"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

type Props = { children: ReactNode };

/**
 * Smooth scroll (Lenis). Keeps native scroll position in sync for listeners (e.g. moon parallax).
 * Avoid combining with CSS scroll-behavior: smooth on html.
 */
export function SmoothScroll({ children }: Props) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      smoothWheel: true,
    });
    return () => {
      lenis.destroy();
    };
  }, []);

  return children;
}
