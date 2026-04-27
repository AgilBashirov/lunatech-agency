"use client";

import Lenis from "lenis";
import { useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LenisContext } from "@/context/lenis-context";
import { HashScrollOnAnchors } from "@/components/layout/HashScrollOnAnchors";

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

    queueMicrotask(() => {
      setLenis(lenisInstance);
    });

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
      lenisInstance.destroy();
      queueMicrotask(() => {
        setLenis(null);
      });
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <HashScrollOnAnchors />
      {children}
    </LenisContext.Provider>
  );
}
