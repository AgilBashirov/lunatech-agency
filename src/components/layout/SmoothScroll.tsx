"use client";

import Lenis from "lenis";
import { useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LenisContext } from "@/context/lenis-context";
import { HashScrollOnAnchors } from "@/components/layout/HashScrollOnAnchors";
import { ResetScrollOnLoad } from "@/components/layout/ResetScrollOnLoad";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll (Lenis). Syncs with GSAP ScrollTrigger via scrollerProxy + ticker.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenisInstance = new Lenis({
      autoRaf: false,
      lerp: 0.09,
      smoothWheel: true,
    });

    // Publish the freshly-constructed Lenis instance to context immediately.
    // This is a setState-in-effect call, but it's the accepted pattern for
    // surfacing externally-created singletons (Lenis, GSAP, IO) to consumers
    // — the alternative (useSyncExternalStore) is heavier and offers no real
    // benefit when the source is created exactly once per mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(lenisInstance);

    lenisInstance.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && typeof value === "number") {
          lenisInstance.scrollTo(value, { immediate: true });
        }
        return lenisInstance.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          bottom: window.innerHeight,
          right: window.innerWidth,
        } as DOMRect;
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });

    const onTick = (time: number) => {
      lenisInstance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      // Clear the context value BEFORE destroying so consumers never observe
      // a destroyed instance. Order matters: a consumer reading via context
      // during the tear-down phase would otherwise call into a dead Lenis.
      setLenis(null);
      lenisInstance.destroy();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <ResetScrollOnLoad />
      <HashScrollOnAnchors />
      {children}
    </LenisContext.Provider>
  );
}
