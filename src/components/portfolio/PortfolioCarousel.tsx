"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

const AUTO_MS = 5200;
const RESUME_AFTER_MS = 9000;
const PROGRAMMATIC_MS = 1400;
const NORMALIZE_DEBOUNCE_MS = 120;

function scrollSlideToCenter(
  scroller: HTMLElement,
  slide: HTMLElement,
  behavior: ScrollBehavior = "smooth",
) {
  const slideLeft = slide.offsetLeft;
  const slideW = slide.offsetWidth;
  const viewW = scroller.clientWidth;
  const target = slideLeft - (viewW - slideW) / 2;
  scroller.scrollTo({ left: Math.max(0, target), behavior });
}

export function PortfolioCarousel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  /** Logical slide index (0 .. halfLen-1) */
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const programmaticUntilRef = useRef(0);
  const reduceMotionRef = useRef(false);
  const isNormalizingRef = useRef(false);

  const slides = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return [];
    return [
      ...root.querySelectorAll<HTMLElement>("[data-portfolio-slide]"),
    ];
  }, []);

  const clearIntervalOnly = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearResume = useCallback(() => {
    if (resumeRef.current) {
      clearTimeout(resumeRef.current);
      resumeRef.current = null;
    }
  }, []);

  const clearNormalizeDebounce = useCallback(() => {
    if (normalizeDebounceRef.current) {
      clearTimeout(normalizeDebounceRef.current);
      normalizeDebounceRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearIntervalOnly();
    clearResume();
    clearNormalizeDebounce();
  }, [clearIntervalOnly, clearResume, clearNormalizeDebounce]);

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    const list = slides();
    if (!el || list.length === 0) return;
    const half = Math.floor(list.length / 2);
    if (half === 0) return;

    const centerX = el.scrollLeft + el.clientWidth / 2;
    let bestPhysical = 0;
    let bestDist = Infinity;
    list.forEach((slide, i) => {
      const mid = slide.offsetLeft + slide.offsetWidth / 2;
      const d = Math.abs(mid - centerX);
      if (d < bestDist) {
        bestDist = d;
        bestPhysical = i;
      }
    });
    indexRef.current = bestPhysical % half;
  }, [slides]);

  const normalizeLoopPosition = useCallback(() => {
    const el = scrollerRef.current;
    const list = slides();
    const half = Math.floor(list.length / 2);
    if (!el || half === 0 || list.length < half * 2) return;

    const centerX = el.scrollLeft + el.clientWidth / 2;
    let bestPhysical = 0;
    let bestDist = Infinity;
    list.forEach((slide, i) => {
      const mid = slide.offsetLeft + slide.offsetWidth / 2;
      const d = Math.abs(mid - centerX);
      if (d < bestDist) {
        bestDist = d;
        bestPhysical = i;
      }
    });

    if (bestPhysical < half) return;

    const stride = list[half]!.offsetLeft - list[0]!.offsetLeft;
    if (stride <= 0) return;

    isNormalizingRef.current = true;
    programmaticUntilRef.current = Date.now() + 280;
    el.scrollTo({
      left: el.scrollLeft - stride,
      behavior: "instant" as ScrollBehavior,
    });
    requestAnimationFrame(() => {
      isNormalizingRef.current = false;
      syncIndexFromScroll();
    });
  }, [slides, syncIndexFromScroll]);

  const scheduleNormalize = useCallback(() => {
    if (isNormalizingRef.current) return;
    clearNormalizeDebounce();
    const run = () => {
      normalizeDebounceRef.current = null;
      normalizeLoopPosition();
    };
    normalizeDebounceRef.current = setTimeout(run, NORMALIZE_DEBOUNCE_MS);
  }, [clearNormalizeDebounce, normalizeLoopPosition]);

  const advance = useCallback(() => {
    const el = scrollerRef.current;
    const list = slides();
    const half = Math.floor(list.length / 2);
    if (!el || half === 0 || list.length < half * 2) return;

    syncIndexFromScroll();
    const L = indexRef.current;
    const nextL = (L + 1) % half;
    programmaticUntilRef.current = Date.now() + PROGRAMMATIC_MS;

    if (L === half - 1 && nextL === 0) {
      scrollSlideToCenter(el, list[half]!, "smooth");
    } else {
      scrollSlideToCenter(el, list[nextL]!, "smooth");
    }
    indexRef.current = nextL;
  }, [slides, syncIndexFromScroll]);

  const startAuto = useCallback(() => {
    clearIntervalOnly();
    clearResume();
    if (reduceMotionRef.current) return;
    intervalRef.current = setInterval(advance, AUTO_MS);
  }, [advance, clearIntervalOnly, clearResume]);

  const pauseAndScheduleResume = useCallback(() => {
    clearIntervalOnly();
    clearResume();
    resumeRef.current = setTimeout(() => {
      resumeRef.current = null;
      startAuto();
    }, RESUME_AFTER_MS);
  }, [clearIntervalOnly, clearResume, startAuto]);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    startAuto();
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers, startAuto]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isNormalizingRef.current) return;
      if (Date.now() < programmaticUntilRef.current) return;
      pauseAndScheduleResume();
      scheduleNormalize();
    };

    const onScrollEnd = () => {
      normalizeLoopPosition();
    };

    const onPointerDown = () => {
      pauseAndScheduleResume();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEnd);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("touchstart", onPointerDown, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("touchstart", onPointerDown);
    };
  }, [normalizeLoopPosition, pauseAndScheduleResume, scheduleNormalize]);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        normalizeLoopPosition();
        syncIndexFromScroll();
      }, 200);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [normalizeLoopPosition, syncIndexFromScroll]);

  const items = Children.toArray(children);
  const slideClass =
    "w-[min(22rem,max(17rem,calc(100vw-2rem)))] shrink-0 snap-center touch-pan-x sm:w-[min(24rem,calc(100vw-2.75rem))] md:w-[min(23rem,calc(100vw-3.25rem))]";

  return (
    <div
      ref={scrollerRef}
      className={cn(
        "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [scroll-padding-inline:max(1.25rem,env(safe-area-inset-left,0px))_max(1.25rem,env(safe-area-inset-right,0px))] sm:gap-7 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((child, i) => {
        const baseKey = isValidElement(child) ? child.key ?? `slide-${i}` : `slide-${i}`;
        return (
          <div key={String(baseKey)} data-portfolio-slide className={slideClass}>
            {child}
          </div>
        );
      })}
      {items.map((child, i) => {
        const baseKey = isValidElement(child) ? child.key ?? `slide-${i}` : `slide-${i}`;
        return (
          <div
            key={`${String(baseKey)}__loop`}
            data-portfolio-slide
            className={slideClass}
            aria-hidden
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
