"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type CardsSliderCard = {
  id: number;
  title: string;
  description: string;
  href?: string;
  /** Remote hero image (demo mode) */
  imageUrl?: string;
  /** Custom cover, e.g. `PortfolioCoverArt` */
  cover?: ReactNode;
};

const DEMO_CARDS: CardsSliderCard[] = [
  {
    id: 1,
    title: "Liquid Motion",
    description:
      "Experience the fluid dynamics of modern web interactions with physics-based animations.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
  {
    id: 2,
    title: "Glassmorphism",
    description:
      "Blur the lines between layers with advanced backdrop filters and transparency effects.",
    imageUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  },
  {
    id: 3,
    title: "Dark Mode",
    description:
      "Easy on the eyes, elegant in appearance. A seamless transition to the dark side.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80",
  },
  {
    id: 4,
    title: "Micro-Interactions",
    description:
      "Delightful details that make the difference between good and great user experience.",
    imageUrl:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
  },
  {
    id: 5,
    title: "Responsive Layouts",
    description:
      "Fluid grids that adapt to any screen size, ensuring your content looks perfect everywhere.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
];

/** Transition used by arrow/dot/keyboard navigation + drag-end snap. */
const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 280,
  damping: 32,
  mass: 1,
};
/** Drag velocity threshold (px/s) that forces a one-slide advance regardless of proximity. */
const FLICK_VELOCITY = 320;

/**
 * For seamless infinite loop we render `count * LOOP_COPIES` cards in the track
 * and keep the canonical position anchored to the *middle* copy. After any
 * animation settles, the virtual index is silently wrapped back into the
 * middle copy — visually identical because adjacent copies share content.
 */
const LOOP_COPIES = 3;
const LOOP_ANCHOR_COPY = 1;

/** Card height. Keeping this fixed per breakpoint avoids layout shift as width changes. */
const CARD_HEIGHT_MOBILE = 380; // below sm
const CARD_HEIGHT_TABLET = 380; // sm..lg
const CARD_HEIGHT_DESKTOP = 380; // lg+

type SliderLayout = {
  /** Number of cards visible simultaneously at this breakpoint. */
  visible: number;
  /** Flex gap (px) between cards. */
  gap: number;
  /** Whether arrow controls should render at this breakpoint. */
  arrows: boolean;
};

/**
 * Resolves the slider layout from the window width.
 *  - <640px (mobile)         → 1 card, no arrows
 *  - 640..1023 (tablet)      → 3 cards, no arrows
 *  - 1024..1439 (laptop)     → 4 cards, arrows
 *  - 1440..1919 (wide)       → 5 cards, arrows
 *  - ≥1920px (ultra-wide)    → 6 cards, arrows  ← prevents oversized cards on 1920+ displays
 */
function resolveLayout(width: number): SliderLayout {
  if (width >= 1920) return { visible: 6, gap: 28, arrows: true };
  if (width >= 1440) return { visible: 5, gap: 28, arrows: true };
  if (width >= 1024) return { visible: 4, gap: 24, arrows: true };
  if (width >= 640) return { visible: 3, gap: 20, arrows: false };
  return { visible: 1, gap: 16, arrows: false };
}

function useSliderLayout(): SliderLayout {
  // Start with a neutral "mobile" default for SSR; real value is computed on mount.
  const [layout, setLayout] = useState<SliderLayout>(() => ({
    visible: 1,
    gap: 16,
    arrows: false,
  }));

  useEffect(() => {
    const apply = () => setLayout(resolveLayout(window.innerWidth));
    apply();
    window.addEventListener("resize", apply, { passive: true });
    window.addEventListener("orientationchange", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  return layout;
}

function BrandArrow({
  direction,
  gradId,
  id,
  ariaLabel,
  onPress,
  disabled = false,
  className,
}: {
  direction: "prev" | "next";
  gradId: string;
  id: string;
  ariaLabel: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      id={id}
      type="button"
      className={cn(
        // Compact 36×36 chevron pill — refined, less chrome than the previous
        // 44×44 glass pill. Arrows only render at lg+ (desktop) so mouse
        // targets are fine at this size.
        "absolute top-1/2 z-40 -translate-y-1/2 touch-manipulation",
        "inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-white/[0.07] bg-[rgba(8,11,20,0.72)] backdrop-blur-sm",
        "shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
        "transition-[transform,opacity,background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none",
        disabled
          ? "pointer-events-none opacity-0"
          : "cursor-pointer opacity-80 hover:opacity-100 hover:border-white/20 hover:bg-[rgba(12,15,25,0.85)] hover:shadow-[0_4px_18px_rgba(124,58,237,0.28),0_0_0_1px_rgba(124,58,237,0.18)] active:scale-[0.94] motion-reduce:hover:scale-100",
        className,
      )}
      style={{ [isPrev ? "left" : "right"]: "0.75rem" }}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onPress}
    >
      <svg
        className="block"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>
        <path
          d={isPrev ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
          stroke={`url(#${gradId})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Dot({
  index,
  active,
  label,
  onSelect,
}: {
  index: number;
  active: boolean;
  label: string;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={label}
      tabIndex={active ? 0 : -1}
      onClick={() => onSelect(index)}
      className={cn(
        "relative h-2 rounded-full transition-all duration-300 ease-out touch-manipulation",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22d3ee]",
        active
          ? "w-8 bg-[linear-gradient(90deg,#7c3aed,#22d3ee)] shadow-[0_0_10px_rgba(124,58,237,0.45)]"
          : "w-2 bg-white/20 hover:bg-white/35 motion-reduce:transition-none",
      )}
    />
  );
}

export type ArrowVisibility = "always" | "desktop" | "never";

type CardsSliderProps = {
  cards?: CardsSliderCard[];
  /** When true, wraps seamlessly from the last card back to the first. */
  loop?: boolean;
  /** When true, advances automatically on a timer (pauses on hover/drag/hidden/interaction). */
  autoplay?: boolean;
  /** Milliseconds between autoplay advances. Defaults to 5000. */
  autoplayDelay?: number;
  /** Milliseconds to pause autoplay after a user interaction. Defaults to 6000. */
  autoplayResumeDelay?: number;
  /** When arrows are shown. "desktop" = only at ≥1024px. */
  arrowsOn?: ArrowVisibility;
  /** Show pagination dots below the rail. Defaults true when count > 1. */
  showDots?: boolean;
  ariaScrollLeft?: string;
  ariaScrollRight?: string;
  ariaRegion?: string;
  ariaRoleDescription?: string;
  viewDetailsLabel?: string;
  /** Builds per-slide aria-label, e.g. `(current, total) => "Slide 2 of 6"`. */
  slideLabel?: (current: number, total: number) => string;
};

export function CardsSlider({
  cards: cardsProp,
  loop = false,
  autoplay = false,
  autoplayDelay = 5000,
  autoplayResumeDelay = 6000,
  arrowsOn = "always",
  showDots,
  ariaScrollLeft = "Scroll left",
  ariaScrollRight = "Scroll right",
  ariaRegion = "Carousel",
  ariaRoleDescription = "carousel",
  viewDetailsLabel = "View Details",
  slideLabel,
}: CardsSliderProps) {
  const cards = cardsProp ?? DEMO_CARDS;
  const count = cards.length;
  const uid = useId();
  const idBase = `cs${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const gradPrev = `${idBase}-gp`;
  const gradNext = `${idBase}-gn`;
  const prevBtnId = `selected-work-prev-${idBase}`;
  const nextBtnId = `selected-work-next-${idBase}`;

  const layout = useSliderLayout();
  const visible = Math.max(1, Math.min(layout.visible, count));
  const gap = layout.gap;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const x: MotionValue<number> = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Measure the rail viewport so card widths can divide it cleanly.
  const [viewportWidth, setViewportWidth] = useState(0);
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let rafId = 0;
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        setViewportWidth(vp.clientWidth);
      });
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(vp);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  // Card width is the viewport minus inter-card gaps, divided by visibleCount.
  // Math.floor prevents sub-pixel overflow that would cause a slight clip.
  const cardWidth = useMemo(() => {
    if (viewportWidth <= 0) return 0;
    const totalGap = (visible - 1) * gap;
    return Math.max(160, Math.floor((viewportWidth - totalGap) / visible));
  }, [viewportWidth, visible, gap]);

  /** Distance to advance for one slide step. */
  const slideStep = cardWidth + gap;

  const cardHeight = useMemo(() => {
    if (visible >= 4) return CARD_HEIGHT_DESKTOP;
    if (visible >= 2) return CARD_HEIGHT_TABLET;
    return CARD_HEIGHT_MOBILE;
  }, [visible]);

  /** Base virtual index for the middle copy, so "0" canonically equals this value. */
  const CANONICAL_BASE = loop ? count * LOOP_ANCHOR_COPY : 0;

  /**
   * Virtual index is the SOURCE OF TRUTH for the slider position. The track's
   * x motion value is derived from it. Rapid clicks bump this integer
   * deterministically; React re-renders, the effect below retargets the
   * animation (or snaps instantly on resize). No drift, no lost clicks.
   */
  const [virtualIdx, setVirtualIdx] = useReducer(
    (_: number, next: number) => next,
    CANONICAL_BASE,
  );

  /**
   * Synchronous mirror of `virtualIdx`. Event handlers (rapid clicks, drag end,
   * autoplay tick) write here BEFORE React commits the next render — that way
   * a follow-up handler in the same tick reads the latest position rather than
   * the stale React state value, and we cannot lose increments.
   */
  const virtualIdxRef = useRef<number>(CANONICAL_BASE);
  useEffect(() => {
    virtualIdxRef.current = virtualIdx;
  }, [virtualIdx]);

  // Reset when the card set or base changes (e.g. locale swap, count change).
  useEffect(() => {
    virtualIdxRef.current = CANONICAL_BASE;
    setVirtualIdx(CANONICAL_BASE);
  }, [CANONICAL_BASE, count]);

  /** Active canonical index (0..count-1) — drives dots / live region. */
  const activeIndex = useMemo(() => {
    if (count <= 0) return 0;
    return (((virtualIdx - CANONICAL_BASE) % count) + count) % count;
  }, [virtualIdx, CANONICAL_BASE, count]);

  /** In non-loop mode, how far we can scroll before running out of cards. */
  const maxVirtualNonLoop = useMemo(() => {
    if (loop) return Number.POSITIVE_INFINITY;
    return Math.max(0, count - visible);
  }, [loop, count, visible]);

  const showNav = count > 1 && (loop || maxVirtualNonLoop > 0);
  const dotsVisible = (showDots ?? true) && count > 1 && (loop || maxVirtualNonLoop > 0);

  // Track the previous slideStep so we can detect resize vs navigation.
  const prevSlideStepRef = useRef(0);
  const prevVirtualIdxRef = useRef<number>(CANONICAL_BASE);
  const hasMountedRef = useRef(false);

  /**
   * Drive x from virtualIdx + slideStep. This effect is the SINGLE WRITER for
   * animated motion. Any navigation change (setVirtualIdx) reruns it, stops the
   * previous animation cleanly, and starts a fresh one from the current x.
   *
   * Important: callers (advance / drag end / autoplay) ALWAYS pre-wrap
   * virtualIdx + x so the target stays inside the rendered triple-copy track.
   * This effect therefore never has to wrap post-animation, and the rail can
   * never scroll into a blank region — even under sustained rapid clicking.
   */
  useEffect(() => {
    if (slideStep <= 0) return;
    const target = -virtualIdx * slideStep;

    const isFirst = !hasMountedRef.current;
    const slideStepChanged = prevSlideStepRef.current !== slideStep;
    const virtualIdxChanged = prevVirtualIdxRef.current !== virtualIdx;
    prevSlideStepRef.current = slideStep;
    prevVirtualIdxRef.current = virtualIdx;
    hasMountedRef.current = true;

    // Resize / mount: snap instantly to avoid an entrance slide-in.
    const shouldSnap =
      isFirst ||
      prefersReducedMotion ||
      (slideStepChanged && !virtualIdxChanged);

    if (shouldSnap) {
      x.set(target);
      return;
    }

    const controls = animate(x, target, SPRING_TRANSITION);
    return () => {
      controls.stop();
    };
  }, [virtualIdx, slideStep, prefersReducedMotion, x]);

  // ————— Navigation API —————
  const lastInteractionAtRef = useRef(0);
  const markInteraction = useCallback(() => {
    lastInteractionAtRef.current = Date.now();
  }, []);

  /**
   * Pre-animation safe-wrap. Given a *raw* desired virtualIdx, returns the
   * equivalent index inside the canonical range plus the x shift needed to
   * keep the visual position content-identical.
   *
   * Why: the rendered track only contains `LOOP_COPIES * count` cards. If we
   * let `virtualIdx` (and therefore the animation target `-virtualIdx*S`)
   * drift outside that range, the viewport scrolls past the last rendered
   * card and shows blank space. By shifting both `virtualIdx` and `x` by the
   * same multiple of `count * slideStep` BEFORE starting the animation, the
   * visual stays identical (adjacent loop copies are pixel-equal) while
   * the new target stays comfortably inside rendered bounds.
   */
  const safeWrap = useCallback(
    (rawIdx: number, currentX: number): { idx: number; nextX: number } => {
      if (!loop || count <= 0 || slideStep <= 0) {
        return { idx: rawIdx, nextX: currentX };
      }
      // Highest virtualIdx such that the animation target plus `visible` cards
      // stays inside the rendered track. Below 0 we wrap up; above this we wrap down.
      const maxSafe = Math.max(0, LOOP_COPIES * count - visible);
      let idx = rawIdx;
      let nextX = currentX;
      const period = count * slideStep;
      while (idx > maxSafe) {
        idx -= count;
        nextX += period; // shift the rail right by one period (content-identical)
      }
      while (idx < 0) {
        idx += count;
        nextX -= period;
      }
      return { idx, nextX };
    },
    [count, loop, slideStep, visible],
  );

  /**
   * Single navigation entry point. Reads the latest virtualIdx synchronously
   * from the ref (so rapid clicks don't see stale state), applies safeWrap,
   * commits to ref + state. The animation effect picks it up and animates x
   * to the new (already-safe) target.
   */
  const advance = useCallback(
    (delta: number) => {
      if (!showNav || count <= 0) return;
      const prev = virtualIdxRef.current;
      const raw = prev + delta;
      let nextIdx: number;
      if (loop) {
        const wrapped = safeWrap(raw, x.get());
        if (wrapped.nextX !== x.get()) {
          // Content-identical x shift — invisible to the user. The animation
          // effect about to fire will continue smoothly from this new x.
          x.set(wrapped.nextX);
        }
        nextIdx = wrapped.idx;
      } else {
        nextIdx = Math.max(0, Math.min(maxVirtualNonLoop, raw));
      }
      if (nextIdx === prev) return; // nothing to do (clamp at non-loop end)
      virtualIdxRef.current = nextIdx;
      setVirtualIdx(nextIdx);
    },
    [count, loop, maxVirtualNonLoop, safeWrap, showNav, x],
  );

  const goNext = useCallback(() => {
    markInteraction();
    advance(1);
  }, [advance, markInteraction]);

  const goPrev = useCallback(() => {
    markInteraction();
    advance(-1);
  }, [advance, markInteraction]);

  const goToCanonical = useCallback(
    (targetCanonical: number) => {
      if (count <= 0) return;
      markInteraction();
      if (loop) {
        // Choose the shortest signed path around the loop, then defer to advance().
        const prev = virtualIdxRef.current;
        const prevCanonical =
          (((prev - CANONICAL_BASE) % count) + count) % count;
        let delta = (((targetCanonical - prevCanonical) % count) + count) % count;
        if (delta > count / 2) delta -= count;
        advance(delta);
      } else {
        const clamped = Math.max(0, Math.min(maxVirtualNonLoop, targetCanonical));
        if (clamped !== virtualIdxRef.current) {
          virtualIdxRef.current = clamped;
          setVirtualIdx(clamped);
        }
      }
    },
    [CANONICAL_BASE, advance, count, loop, markInteraction, maxVirtualNonLoop],
  );

  const canGoPrev = showNav && (loop || virtualIdx > 0);
  const canGoNext = showNav && (loop || virtualIdx < maxVirtualNonLoop);

  // ————— Drag —————
  const [isDragging, setIsDragging] = useState(false);
  const onDragStart = useCallback(() => {
    setIsDragging(true);
    markInteraction();
  }, [markInteraction]);

  const onDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      setIsDragging(false);
      markInteraction();
      if (!showNav || slideStep <= 0) return;

      const nearestVirtual = Math.round(-x.get() / slideStep);
      const vx = info.velocity.x;
      let targetVirtual = nearestVirtual;
      if (vx <= -FLICK_VELOCITY) targetVirtual += 1;
      else if (vx >= FLICK_VELOCITY) targetVirtual -= 1;

      // Route through the same safe-wrap path as arrows so a hard flick never
      // leaves x parked outside the rendered range.
      const delta = targetVirtual - virtualIdxRef.current;
      advance(delta);
    },
    [advance, markInteraction, showNav, slideStep, x],
  );

  const dragConstraints = useMemo(() => {
    if (!showNav || slideStep <= 0) return { left: 0, right: 0 };
    if (loop) {
      // Allow generous drag across the rendered triple copy; resolve on drop.
      const copyWidth = count * slideStep;
      return { left: -LOOP_COPIES * copyWidth, right: copyWidth };
    }
    return { left: -maxVirtualNonLoop * slideStep, right: 0 };
  }, [count, loop, maxVirtualNonLoop, showNav, slideStep]);

  // ————— Keyboard —————
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!showNav) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "Home":
          e.preventDefault();
          goToCanonical(0);
          break;
        case "End":
          e.preventDefault();
          goToCanonical(count - 1);
          break;
        default:
          break;
      }
    },
    [count, goNext, goPrev, goToCanonical, showNav],
  );

  // ————— Autoplay —————
  const isHoverRef = useRef(false);
  const isFocusRef = useRef(false);
  const isDraggingRef = useRef(false);
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const [isVisible, setIsVisible] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Tab visibility (document.hidden)
  useEffect(() => {
    if (!autoplay) return;
    const apply = () => setIsTabVisible(!document.hidden);
    apply();
    document.addEventListener("visibilitychange", apply);
    return () => document.removeEventListener("visibilitychange", apply);
  }, [autoplay]);

  // IntersectionObserver: pause autoplay when slider is off-screen.
  useEffect(() => {
    if (!autoplay) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(!!entry && entry.intersectionRatio > 0.35),
      { threshold: [0, 0.35, 0.75] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);

  // Autoplay loop: every `autoplayDelay` ms, advance by one step — unless paused.
  // Routes through `advance(1)` so it shares the same safe-wrap pipeline as
  // arrows / dots / drag — autoplay cannot drift the rail into a blank state.
  useEffect(() => {
    if (!autoplay) return;
    if (prefersReducedMotion) return;
    if (count <= 1) return;
    const id = window.setInterval(() => {
      if (isDraggingRef.current) return;
      if (isHoverRef.current) return;
      if (isFocusRef.current) return;
      if (!isVisible || !isTabVisible) return;
      if (Date.now() - lastInteractionAtRef.current < autoplayResumeDelay) return;
      // Non-loop: freeze at the end rather than keep advancing.
      if (!loop && virtualIdxRef.current >= maxVirtualNonLoop) return;
      advance(1);
    }, Math.max(1500, autoplayDelay));
    return () => window.clearInterval(id);
  }, [
    advance,
    autoplay,
    autoplayDelay,
    autoplayResumeDelay,
    count,
    isTabVisible,
    isVisible,
    loop,
    maxVirtualNonLoop,
    prefersReducedMotion,
  ]);

  // ————— Render —————
  const renderedCards = useMemo(() => {
    if (!loop) return cards;
    const out: CardsSliderCard[] = [];
    for (let k = 0; k < LOOP_COPIES; k++) out.push(...cards);
    return out;
  }, [cards, loop]);

  const formatSlideLabel = useCallback(
    (current: number) =>
      slideLabel ? slideLabel(current, count) : `${current} / ${count}`,
    [count, slideLabel],
  );

  // Arrow visibility — the request was desktop-only. Use a wrapper so the
  // entire arrow pair collapses together and SSR never shows them on mobile.
  const arrowsWrapperClass =
    arrowsOn === "never"
      ? "hidden"
      : arrowsOn === "desktop"
        ? "hidden lg:contents"
        : "contents";

  return (
    <div
      ref={containerRef}
      // Full-bleed: the carousel claims the full width offered by its parent
      // (PortfolioSection's slider wrapper is itself w-full inside an
      // `uncontained` Section, so this expands to the page edges minus the
      // outer responsive padding below).
      className="group/slider relative w-full px-3 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6 lg:px-12 xl:px-16"
      onMouseEnter={() => {
        isHoverRef.current = true;
      }}
      onMouseLeave={() => {
        isHoverRef.current = false;
      }}
      onFocusCapture={() => {
        isFocusRef.current = true;
      }}
      onBlurCapture={(e) => {
        // Only clear when focus leaves the slider entirely.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          isFocusRef.current = false;
        }
      }}
    >
      {showNav ? (
        // `display: contents` on lg+ lets the absolutely-positioned arrows
        // anchor to the slider container while still allowing a clean
        // `display: none` collapse on mobile/tablet.
        <div className={arrowsWrapperClass}>
          <BrandArrow
            direction="prev"
            gradId={gradPrev}
            id={prevBtnId}
            ariaLabel={ariaScrollLeft}
            onPress={goPrev}
            disabled={!canGoPrev}
          />
          <BrandArrow
            direction="next"
            gradId={gradNext}
            id={nextBtnId}
            ariaLabel={ariaScrollRight}
            onPress={goNext}
            disabled={!canGoNext}
          />
        </div>
      ) : null}

      {/* Screen-reader announcement for slide changes. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {formatSlideLabel(activeIndex + 1)}
      </div>

      <div
        ref={viewportRef}
        className={cn(
          "relative overflow-hidden py-2",
          "[touch-action:pan-y]",
          showNav
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : undefined,
        )}
        data-testid="selected-work-viewport"
        data-selected-snap={activeIndex}
        data-loop={loop ? "true" : "false"}
        data-slide-count={count}
        data-visible-count={visible}
        tabIndex={showNav ? 0 : undefined}
        role="region"
        aria-roledescription={ariaRoleDescription}
        aria-label={ariaRegion}
        onKeyDown={onKeyDown}
      >
        <motion.div
          drag={showNav && cardWidth > 0 ? "x" : false}
          dragConstraints={dragConstraints}
          dragElastic={loop ? 0.04 : 0.12}
          dragMomentum
          style={{ x, gap: `${gap}px` }}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="flex will-change-transform"
        >
          {renderedCards.map((card, i) => {
            const realIdx = loop ? i % count : i;
            const copyIdx = loop ? Math.floor(i / count) : 0;
            const isClone = loop && copyIdx !== LOOP_ANCHOR_COPY;
            const isActive = realIdx === activeIndex;
            return (
              <motion.div
                key={`${card.id}-${i}`}
                data-embla-slide=""
                role={isClone ? "presentation" : "group"}
                aria-roledescription={isClone ? undefined : "slide"}
                aria-label={isClone ? undefined : formatSlideLabel(realIdx + 1)}
                aria-current={!isClone && isActive ? "true" : undefined}
                aria-hidden={isClone ? "true" : undefined}
                className="shrink-0"
                style={{
                  width: cardWidth > 0 ? cardWidth : undefined,
                  minWidth: cardWidth > 0 ? cardWidth : undefined,
                  maxWidth: cardWidth > 0 ? cardWidth : undefined,
                  height: cardHeight,
                }}
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : { y: -6, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } }
                }
              >
                <CardContent
                  card={card}
                  viewDetailsLabel={viewDetailsLabel}
                  ctaHref={card.href}
                  suppressClick={isDragging}
                  isClone={isClone}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {dotsVisible ? (
        <div
          role="tablist"
          aria-label={ariaRegion}
          // Tighter gap on mobile so 6+ dots always fit on a 320px viewport
          // (6 dots × 8px + 5 gaps × 6px = 78px well within the rail).
          className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:mt-6 sm:gap-2"
        >
          {cards.map((_, i) => (
            <Dot
              key={i}
              index={i}
              active={i === activeIndex}
              label={formatSlideLabel(i + 1)}
              onSelect={goToCanonical}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CardContent({
  card,
  viewDetailsLabel,
  ctaHref,
  suppressClick = false,
  isClone = false,
}: {
  card: CardsSliderCard;
  viewDetailsLabel: string;
  ctaHref?: string;
  /** True while the track is being dragged — prevents accidental link activation. */
  suppressClick?: boolean;
  /** Clone cards (loop copies) don't get focusable links. */
  isClone?: boolean;
}) {
  return (
    <Card
      className={cn(
        "group/card relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl",
        "border-border bg-card/95 text-card-foreground shadow-[0_14px_44px_-18px_rgba(0,0,0,0.75)]",
        "backdrop-blur-md transition-[border-color,box-shadow,transform] duration-500 ease-out",
        "hover:border-primary/35 hover:shadow-[0_20px_50px_-14px_rgba(0,0,0,0.65),0_0_0_1px_var(--glow-purple),0_0_36px_var(--glow-cyan)]",
      )}
    >
      <div className="relative h-40 shrink-0 overflow-hidden bg-surface ring-1 ring-inset ring-white/[0.06] sm:h-44">
        {card.cover ? (
          <div className="h-full w-full [&_.portfolio-cover]:min-h-[10rem] sm:[&_.portfolio-cover]:min-h-[11rem]">
            {card.cover}
          </div>
        ) : card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- demo Unsplash URLs; portfolio uses `cover` slot
          <img
            src={card.imageUrl}
            alt={card.title}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="pointer-events-none h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
          />
        ) : null}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-background/55 to-transparent opacity-70 transition-opacity duration-300 group-hover/card:opacity-55"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,rgba(124,58,237,0.12),transparent_55%)]"
          aria-hidden
        />
      </div>

      {ctaHref ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 border-t border-white/[0.06] bg-[color-mix(in_oklab,var(--card-bg-inner)_88%,transparent)] px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3.5">
          <div className="min-h-0 space-y-1.5">
            <h3 className="text-card-heading text-lg font-bold leading-snug tracking-tight sm:text-xl">
              {card.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-snug text-slate-500 sm:text-sm sm:leading-relaxed">
              {card.description}
            </p>
          </div>
          <span className="gradient-border-wrap gradient-border-wrap--subtle mt-auto inline-flex w-fit max-w-full rounded-full self-start">
            <motion.a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              tabIndex={isClone ? -1 : undefined}
              aria-hidden={isClone ? "true" : undefined}
              onDragStart={(e) => e.preventDefault()}
              onClickCapture={(e) => {
                if (suppressClick || isClone) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group/btn gradient-border-inner inline-flex h-11 max-w-full shrink items-center justify-center gap-1.5 rounded-full px-3.5 sm:gap-2 sm:px-5 md:px-6",
                "text-[0.8125rem] font-semibold leading-none tracking-wide text-white no-underline outline-none touch-manipulation sm:text-sm",
                "transition-shadow duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]",
                "hover:shadow-[0_0_18px_rgba(124,58,237,0.35),0_0_28px_rgba(34,211,238,0.12)]",
              )}
              aria-label={`${card.title} — ${viewDetailsLabel}`}
            >
              {viewDetailsLabel}
              <span
                aria-hidden
                className="inline-block transition-transform duration-200 group-hover/btn:translate-x-0.5"
              >
                →
              </span>
            </motion.a>
          </span>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-white/[0.06] bg-[color-mix(in_oklab,var(--card-bg-inner)_88%,transparent)] px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3.5">
          <div className="min-h-0 space-y-1.5">
            <h3 className="text-card-heading text-lg font-bold leading-snug tracking-tight sm:text-xl">
              {card.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-snug text-slate-500 sm:text-sm sm:leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
