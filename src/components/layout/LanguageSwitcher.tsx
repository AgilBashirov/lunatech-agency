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

type AppLocale = (typeof routing.locales)[number];

/**
 * Dil keçidçisi: `setPointerCapture` root-da **klikin** düyməyə çatmamasına səbəb olurdu.
 * Yalnız düymə `onClick` + pill animasiyası; üfüqi sürüşdürmə sonraya ayrıca əlavə oluna bilər.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const locales = routing.locales;
  const pct = 100 / locales.length;

  const activeIndex = Math.max(0, locales.indexOf(locale as AppLocale));
  const rootRef = useRef<HTMLDivElement>(null);
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
    (next: AppLocale) => {
      if (next === locale) return;
      router.replace(pathname, { locale: next });
    },
    [locale, pathname, router],
  );

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Language"
      className="relative flex rounded-full border border-white/[0.08] bg-[#05060a]/60 p-0.5 backdrop-blur-md"
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
          onClick={() => goLocale(loc)}
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
