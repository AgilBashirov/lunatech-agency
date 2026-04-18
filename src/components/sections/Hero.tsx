"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLenis } from "@/context/lenis-context";
import { useMoonReady } from "@/context/moon-ready";
import { motionTransition } from "@/lib/motion";
import { scrollToElementWithLenis } from "@/lib/smoothScroll";

export function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const { moonSceneReady } = useMoonReady();

  const scrollToNextSection = useCallback(() => {
    const el = document.getElementById("services");
    if (!el) {
      return;
    }
    scrollToElementWithLenis(el, lenis, Boolean(reduce));
    window.history.replaceState(null, "", "#services");
  }, [lenis, reduce]);

  const scrollHintClass =
    "absolute bottom-[max(2rem,env(safe-area-inset-bottom,0px))] left-1/2 z-[2] flex min-h-[44px] min-w-[44px] -translate-x-1/2 flex-col items-center justify-center gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-400 transition-colors duration-300 ease-out hover:text-cyan-300/90";

  return (
    <section
      id="hero"
      className="relative z-10 flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 pt-20 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.45]">
        <HeroVideo />
        <div className="hero-vignette absolute inset-0" aria-hidden />
        <div className="hero-purple-glow absolute inset-0 opacity-90" aria-hidden />
        {!reduce ? (
          <motion.div
            className="hero-moon-placeholder-glow absolute inset-0"
            aria-hidden
            initial={false}
            animate={{ opacity: moonSceneReady ? 0 : 1 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05060a]/22 to-[#070912]/78"
          aria-hidden
        />
        <div className="bg-noise absolute inset-0 opacity-55" aria-hidden />
        <div className="hero-particles absolute inset-0 opacity-90" aria-hidden />
      </div>

      <div className="relative z-[2] mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={reduce ? false : { opacity: 1, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition.smooth}
          className="mx-auto max-w-xl text-center md:mx-0 md:max-w-2xl md:text-left"
        >
          <h1 className="text-gradient-hero text-balance break-words text-4xl font-bold leading-[1.05] tracking-tight drop-shadow-[0_4px_28px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
            {t("headline")}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-zinc-300 md:text-lg [text-shadow:0_1px_28px_rgba(0,0,0,0.72)]">
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

      {reduce ? (
        <button
          type="button"
          className={scrollHintClass}
          aria-label={t("scrollHint")}
          onClick={scrollToNextSection}
        >
          <span>{t("scrollHint")}</span>
          <span className="h-8 w-px bg-gradient-to-b from-cyan-400/80 to-transparent animate-scroll-hint" />
        </button>
      ) : (
        <motion.button
          type="button"
          className={scrollHintClass}
          aria-label={t("scrollHint")}
          onClick={scrollToNextSection}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={motionTransition.smooth}
        >
          <span>{t("scrollHint")}</span>
          <span className="h-8 w-px bg-gradient-to-b from-cyan-400/80 to-transparent animate-scroll-hint" />
        </motion.button>
      )}
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
      className="absolute inset-0 h-full w-full object-cover opacity-[0.72]"
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
