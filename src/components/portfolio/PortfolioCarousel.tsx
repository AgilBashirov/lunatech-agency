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

function scrollSlideToCenter(scroller: HTMLElement, slide: HTMLElement) {
  const slideLeft = slide.offsetLeft;
  const slideW = slide.offsetWidth;
  const viewW = scroller.clientWidth;
  const target = slideLeft - (viewW - slideW) / 2;
  scroller.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
}

export function PortfolioCarousel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticUntilRef = useRef(0);
  const reduceMotionRef = useRef(false);

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

  const clearAllTimers = useCallback(() => {
    clearIntervalOnly();
    clearResume();
  }, [clearIntervalOnly, clearResume]);

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    const list = slides();
    if (!el || list.length === 0) return;
    const centerX = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    list.forEach((slide, i) => {
      const mid = slide.offsetLeft + slide.offsetWidth / 2;
      const d = Math.abs(mid - centerX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    indexRef.current = best;
  }, [slides]);

  const advance = useCallback(() => {
    const el = scrollerRef.current;
    const list = slides();
    if (!el || list.length === 0) return;
    syncIndexFromScroll();
    const next = (indexRef.current + 1) % list.length;
    indexRef.current = next;
    programmaticUntilRef.current = Date.now() + PROGRAMMATIC_MS;
    scrollSlideToCenter(el, list[next]!);
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
      if (Date.now() < programmaticUntilRef.current) return;
      pauseAndScheduleResume();
    };

    const onPointerDown = () => {
      pauseAndScheduleResume();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("touchstart", onPointerDown, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("touchstart", onPointerDown);
    };
  }, [pauseAndScheduleResume]);

  const items = Children.toArray(children);

  return (
    <div
      ref={scrollerRef}
      className={cn(
        "flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-7 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((child, i) => (
        <div
          key={isValidElement(child) ? child.key ?? `slide-${i}` : `slide-${i}`}
          data-portfolio-slide
          className="w-[min(22rem,calc(100vw-2.5rem))] shrink-0 snap-center sm:w-[min(24rem,calc(100vw-3rem))]"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
