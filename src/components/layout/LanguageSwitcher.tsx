"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

const labels: Record<string, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

const SWIPE_PX = 48;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const locales = routing.locales;
  const n = locales.length;
  const pct = 100 / n;

  type AppLocale = (typeof locales)[number];
  const activeIndex = Math.max(0, locales.indexOf(locale as AppLocale));
  const rootRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const dragging = useRef(false);
  const suppressClick = useRef(false);
  const [pillPad, setPillPad] = useState(2);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setPillPad(Math.max(2, Math.round(w * 0.01)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goLocale = useCallback(
    (next: string) => {
      if (next === locale) return;
      router.replace(pathname, { locale: next });
    },
    [locale, pathname, router],
  );

  const navigateBySwipe = useCallback(
    (dx: number) => {
      const i = activeIndex;
      if (dx < -SWIPE_PX && i < n - 1) {
        goLocale(locales[i + 1]!);
        return true;
      }
      if (dx > SWIPE_PX && i > 0) {
        goLocale(locales[i - 1]!);
        return true;
      }
      return false;
    },
    [activeIndex, goLocale, locales, n],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    rootRef.current?.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    dragging.current = true;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      rootRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const dx = e.clientX - startX.current;
    if (navigateBySwipe(dx)) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 320);
    }
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      rootRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const onLocaleClick = (loc: string) => (ev: React.MouseEvent) => {
    if (suppressClick.current) {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
    goLocale(loc);
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Language — tap a code or drag horizontally to switch"
      className="relative flex cursor-grab touch-pan-x rounded-full border border-white/[0.08] bg-[#05060a]/60 p-0.5 backdrop-blur-md active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0.5 top-0.5 rounded-full bg-white/15 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
        initial={false}
        animate={{
          left: `calc(${pct * activeIndex}% + ${pillPad}px)`,
          width: `calc(${pct}% - ${pillPad * 2}px)`,
        }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 420, damping: 34, mass: 0.85 }
        }
      />
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={onLocaleClick(loc)}
          className={cn(
            "relative z-[1] inline-flex min-h-11 min-w-10 flex-1 cursor-pointer items-center justify-center rounded-full px-2 text-xs font-semibold tracking-wide transition-colors duration-300 ease-out sm:min-w-11 sm:px-2.5",
            loc === locale ? "text-white" : "text-zinc-300 hover:text-white",
          )}
        >
          {labels[loc] ?? loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
