"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { motionTransition } from "@/lib/motion";

export function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();

  return (
    <section className="relative z-10 flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-[calc(7rem+env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroVideo />
        <div className="hero-vignette absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05060a]/40 to-[#05060a]"
          aria-hidden
        />
        <div className="bg-noise absolute inset-0 opacity-80" aria-hidden />
        <div className="hero-particles absolute inset-0" aria-hidden />
      </div>

      <div className="relative z-[2] mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={reduce ? false : { opacity: 1, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition.normal}
          className="mx-auto max-w-xl text-center md:mx-0 md:max-w-2xl md:text-left"
        >
          <p className="font-mono mb-4 inline-flex rounded-full border border-white/[0.12] bg-[#0b0f1a]/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-200/90 shadow-[0_0_20px_rgba(34,211,238,0.12)] backdrop-blur-md sm:text-xs">
            {t("badge")}
          </p>
          <h1 className="text-gradient-hero text-balance break-words text-4xl font-bold leading-[1.05] tracking-tight drop-shadow-[0_4px_32px_rgba(0,0,0,0.85)] sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
            {t("headline")}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-zinc-400 md:text-lg">
            {t("sub")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <a href="#contact">
              <Button type="button">{t("cta")}</Button>
            </a>
            <a href="#portfolio">
              <Button type="button" variant="ghost">
                {t("ctaSecondary")}
              </Button>
            </a>
          </div>
        </motion.div>

        <div
          className="relative hidden min-h-[min(52vh,520px)] lg:block"
          aria-hidden
        />
      </div>

      <a
        href="#services"
        className="absolute bottom-[max(2rem,env(safe-area-inset-bottom,0px))] left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500 transition-colors hover:text-cyan-300/90"
      >
        <span>{t("scrollHint")}</span>
        <span className="h-8 w-px bg-gradient-to-b from-cyan-400/80 to-transparent animate-scroll-hint" />
      </a>
    </section>
  );
}

function HeroVideo() {
  const [mediaOk, setMediaOk] = useState(true);
  const [preload, setPreload] = useState<"none" | "metadata">("metadata");

  useEffect(() => {
    queueMicrotask(() => {
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection;
      if (conn?.saveData) {
        setPreload("none");
      }
    });
  }, []);

  if (!mediaOk) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-[#05060a] to-cyan-950/40"
        aria-hidden
      />
    );
  }

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover opacity-60"
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      onError={() => setMediaOk(false)}
    >
      <source src="/hero/hero.webm" type="video/webm" />
      <source src="/hero/hero.mp4" type="video/mp4" />
    </video>
  );
}
