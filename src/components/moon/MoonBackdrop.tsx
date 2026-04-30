"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MoonScene = dynamic(
  () => import("./MoonScene").then((m) => m.MoonScene),
  { ssr: false, loading: () => null },
);

/**
 * Per-breakpoint tier:
 *  - baseScale          → fixed visual moon size at this breakpoint. Stays
 *                         constant during scroll (zoomBlend=0 on mobile/tablet
 *                         locks size; on desktop the cinematic zoom is small
 *                         around this baseline).
 *  - scrollMotionScale  → drives rotation (Y/X) and incidental cam/pos Y.
 *  - scrollZoomScale    → drives size-affecting transforms only (posZ, scale,
 *                         cameraZ). Set to 0 on phone/tablet so the moon never
 *                         visually grows or shrinks during scroll, while still
 *                         spinning. */
type MoonTier = {
  offsetX: number;
  baseScale: number;
  dprMax: number;
  sphereSegments: number;
  antialias: boolean;
  idleTimeScale: number;
  scrollMotionScale: number;
  scrollZoomScale: number;
};

// Visual feel matches the previous (45cbc1f) version exactly: moon at full
// scale on every breakpoint. The "smaller on mobile" effect comes naturally
// from the smaller viewport, not from shrinking the model. What CHANGED here
// is purely behavioral:
//  - mobile/tablet: scrollZoomScale=0 → no scroll-driven size change.
//  - desktop: scrollZoomScale=0.88 → the same subtle cinematic breathing zoom.
const TIERS = {
  mobile: {
    offsetX: 0.6,
    baseScale: 1,
    dprMax: 1.25,
    sphereSegments: 32,
    antialias: false,
    idleTimeScale: 0.5,
    scrollMotionScale: 0.4,
    scrollZoomScale: 0,
  },
  tablet: {
    offsetX: 0.78,
    baseScale: 1,
    dprMax: 1.5,
    sphereSegments: 48,
    antialias: true,
    idleTimeScale: 0.75,
    scrollMotionScale: 0.62,
    scrollZoomScale: 0,
  },
  desktop: {
    offsetX: 1.02,
    baseScale: 1,
    dprMax: 2,
    sphereSegments: 64,
    antialias: true,
    idleTimeScale: 1,
    scrollMotionScale: 0.88,
    scrollZoomScale: 0.88,
  },
} as const satisfies Record<string, MoonTier>;

type Breakpoint = keyof typeof TIERS;

function resolveBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "mobile";
  if (window.matchMedia("(min-width: 1024px)").matches) return "desktop";
  if (window.matchMedia("(min-width: 768px)").matches) return "tablet";
  return "mobile";
}

function useMoonResponsive(): MoonTier {
  // Synchronous initializer: on the client, `useState` calls this function
  // during the very first render, so `bp` already reflects the actual
  // viewport before any effect runs. This eliminates the mobile→desktop
  // tier flicker we'd otherwise get when a desktop user lands on the page.
  //
  // On the server `window` is undefined and we fall back to "mobile" — but
  // since `MoonScene` is dynamically imported with ssr:false, the rendered
  // DOM under `MoonBackdrop` is null on both server and client until the
  // chunk loads, so no hydration mismatch reaches the user's eyes.
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window === "undefined" ? "mobile" : resolveBreakpoint(),
  );

  useEffect(() => {
    const apply = () => {
      const next = resolveBreakpoint();
      setBp((prev) => (prev === next ? prev : next));
    };
    // Re-check once on mount in case the initializer ran before
    // matchMedia was authoritative (extremely rare, but cheap).
    apply();

    const mTablet = window.matchMedia("(min-width: 768px)");
    const mDesktop = window.matchMedia("(min-width: 1024px)");
    mTablet.addEventListener("change", apply);
    mDesktop.addEventListener("change", apply);
    return () => {
      mTablet.removeEventListener("change", apply);
      mDesktop.removeEventListener("change", apply);
    };
  }, []);

  return TIERS[bp];
}

export function MoonBackdrop() {
  const tier = useMoonResponsive();
  return (
    <MoonScene
      offsetX={tier.offsetX}
      baseScale={tier.baseScale}
      dprMax={tier.dprMax}
      sphereSegments={tier.sphereSegments}
      antialias={tier.antialias}
      idleTimeScale={tier.idleTimeScale}
      scrollMotionScale={tier.scrollMotionScale}
      scrollZoomScale={tier.scrollZoomScale}
    />
  );
}
