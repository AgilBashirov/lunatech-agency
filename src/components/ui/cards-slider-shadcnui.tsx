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
/** Used for reduced-motion users and for post-animation silent wraps. */
const INSTANT_TRANSITION = { duration: 0 } as const;

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
  const [virtualIdx, setVirtualIdx] = useState<number>(() => CANONICAL_BASE);

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
   *