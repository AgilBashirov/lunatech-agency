"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/cn";
import { motionTransition } from "@/lib/motion";

const links = [
  { href: "#services", key: "services" as const },
  { href: "#about", key: "about" as const },
  { href: "#portfolio", key: "portfolio" as const },
  { href: "#contact", key: "contact" as const },
];

const navLinkClass =
  "flex min-h-11 shrink-0 snap-start items-center rounded-full px-3 py-2 text-xs font-medium text-zinc-400 transition-colors duration-300 ease-out hover:bg-white/[0.04] hover:text-white md:min-h-0 md:rounded-none md:bg-transparent md:px-0 md:py-0 md:text-sm";

const contactLinkClass =
  "rounded-full border border-cyan-400/35 bg-cyan-400/10 text-sm font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition-all duration-300 ease-out hover:border-cyan-300/50 hover:shadow-[0_0_28px_rgba(124,58,237,0.2)]";

const mobileContactClass =
  "inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 text-xs font-semibold text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.15)] transition-all duration-300 ease-out hover:border-cyan-300/45 hover:shadow-[0_0_22px_rgba(34,211,238,0.22)]";

export function Navbar() {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/[0.08] bg-[#05060a]/75 backdrop-blur-md",
      )}
    >
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex items-center justify-between gap-3 md:contents">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 rounded-xl py-1 opacity-95 transition-opacity duration-300 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]"
          >
            <Image
              src="/brand/logo.svg"
              alt="Lunatech Agency"
              width={200}
              height={200}
              className="h-9 w-auto sm:h-10"
              priority
              unoptimized
            />
            <span className="font-mono hidden text-[9px] uppercase tracking-[0.35em] text-zinc-600 lg:inline">
              {t("tagline")}
            </span>
          </Link>
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            {reduce ? (
              <a href="#contact" className={mobileContactClass}>
                {t("contact")}
              </a>
            ) : (
              <motion.a
                href="#contact"
                className={mobileContactClass}
                whileTap={{ scale: 0.98 }}
                transition={motionTransition.fast}
              >
                {t("contact")}
              </motion.a>
            )}
          </div>
        </div>
        <div className="flex min-h-11 min-w-0 w-full snap-x snap-mandatory scroll-ps-1 scroll-pe-1 gap-1 overflow-x-auto overscroll-x-contain touch-pan-x pb-1 [-webkit-overflow-scrolling:touch] md:min-h-0 md:w-auto md:snap-none md:items-center md:gap-8 md:overflow-visible md:overscroll-x-auto md:touch-auto md:pb-0">
          {links.map(({ href, key }) =>
            reduce ? (
              <a key={key} href={href} className={navLinkClass}>
                {t(key)}
              </a>
            ) : (
              <motion.a
                key={key}
                href={href}
                className={navLinkClass}
                whileTap={{ scale: 0.98 }}
                transition={motionTransition.fast}
              >
                {t(key)}
              </motion.a>
            ),
          )}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {reduce ? (
            <a href="#contact" className={cn(contactLinkClass, "px-4 py-2")}>
              {t("contact")}
            </a>
          ) : (
            <motion.a
              href="#contact"
              className={cn(contactLinkClass, "px-4 py-2")}
              whileTap={{ scale: 0.98 }}
              transition={motionTransition.fast}
            >
              {t("contact")}
            </motion.a>
          )}
        </div>
      </nav>
    </header>
  );
}
