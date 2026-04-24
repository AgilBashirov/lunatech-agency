"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MoonScene = dynamic(
  () => import("./MoonScene").then((m) => m.MoonScene),
  { ssr: false, loading: () => null },
);

/** Conservative defaults = phone tier until matchMedia runs (avoids flash / null). */
const DEFAULT_TIER = {
  offsetX: 0.6,
  dprMax: 1.25,
  sphereSegments: 32,
  antialias: false,
  idleTimeScale: 0.5,
  scrollMotionScale: 0.4,
} as const;

type MoonTier = {
  offsetX: number;
  dprMax: number;
  sphereSegments: number;
  antialias: boolean;
  idleTimeScale: number;
  scrollMotionScale: number;
};

function useMoonResponsive(): MoonTier {
  const [tier, setTier] = useState<MoonTier>(() => ({ ...DEFAULT_TIER }));

  useEffect(() => {
    const apply = () => {
      const tabletUp = window.matchMedia("(min-width: 768px)");
      const desktopUp = window.matchMedia("(min-width: 1024px)");
      if (!tabletUp.matches) {
        setTier({
          offsetX: 0.6,
          dprMax: 1, // mobile: clamp DPR to 1 (was 1.25) — fewer fragment ops, faster init
          sphereSegments: 24, // was 32 — fewer triangles for the procedural fallback
          antialias: false,
          idleTimeScale: 0.5,
          scrollMotionScale: 0.4,
        });
      } else if (!desktopUp.matches) {
        setTier({
          offsetX: 0.78,
          dprMax: 1.25, // was 1.5
          sphereSegments: 36, // was 48
          antialias: true,
          idleTimeScale: 0.75,
          scrollMotionScale: 0.62,
        });
      } else {
        setTier({
          offsetX: 1.02,
          dprMax: 1.75, // was 2 — barely visible quality drop, ~25% fewer pixels to shade
          sphereSegments: 56, // was 64
          antialias: true,
          idleTimeScale: 1,
          scrollMotionScale: 0.88,
        });
      }
    };
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

  return tier;
}

export function MoonBackdrop() {
  const tier = useMoonResponsive();
  return (
    <MoonScene
    