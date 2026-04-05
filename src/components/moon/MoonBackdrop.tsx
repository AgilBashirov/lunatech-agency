"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MoonScene = dynamic(
  () => import("./MoonScene").then((m) => m.MoonScene),
  { ssr: false, loading: () => null },
);

type MoonTier = {
  showMoon: boolean;
  offsetX: number;
  dprMax: number;
  sphereSegments: number;
};

/** Below md: no WebGL moon (CSS hero background only) — saves phones GPU/battery. */
function useMoonResponsive(): MoonTier | null {
  const [tier, setTier] = useState<MoonTier | null>(null);

  useEffect(() => {
    const apply = () => {
      const tabletUp = window.matchMedia("(min-width: 768px)");
      const desktopUp = window.matchMedia("(min-width: 1024px)");
      if (!tabletUp.matches) {
        setTier({
          showMoon: false,
          offsetX: 0.45,
          dprMax: 1,
          sphereSegments: 32,
        });
      } else if (!desktopUp.matches) {
        setTier({
          showMoon: true,
          offsetX: 0.88,
          dprMax: 1.5,
          sphereSegments: 48,
        });
      } else {
        setTier({
          showMoon: true,
          offsetX: 1.25,
          dprMax: 2,
          sphereSegments: 64,
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
  if (!tier?.showMoon) return null;
  return (
    <MoonScene
      offsetX={tier.offsetX}
      dprMax={tier.dprMax}
      sphereSegments={tier.sphereSegments}
    />
  );
}
