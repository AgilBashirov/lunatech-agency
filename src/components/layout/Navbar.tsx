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
];

const navLinkClass =
  // Mobile: pill-shaped row item with tap-background. Desktop: inline label with
  // an underline that slides in from the left on hover — small, non-flashy.
  "relative flex min-h-11 shrink-0 snap-start items-center rounded-full px-3 py-2 text-xs font-medium text-zinc-300 transition-colors duration-300 ease-out hover:bg-white/[0.04] hover:text-white md:min-h-0 md:rounded-none md:bg-transparent md:px-0 md:py-0 md:text-sm md:hover:bg-transparent " +
  // Desktop-only animated underline
  "md:after:pointer-events-none md:after:absolute md:after:-bottom-1 md:after:left-0 md:after:h-px md:after:w-full md:after:origin-left md:after:scale-x-0 md:after:bg-[linear-gradient(90deg,rgba(124,58,237,0.9),rgba(34,211,238,0.9))] md:after:transition-transform md:after:duration-300 md:after:ease-out md:hover:after:scale-x-100 motion-reduce:md:after:transition-none";

export function Navbar() {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();

  return (
    <header
      id="site-header"
      className={cn(
        "sticky top-0 z-50 border-b border-white/[0.08] bg-[#05060a]/75 backdrop-blur-md pt-safe",
      )}
    >
      {/*
        max-w-7xl + px-4 sm:px-6 lg:px-8 mirrors the Hero section's container so the
        logo's left edge lines up perfectly with the hero headline beneath it
        (was max-w-6xl, which created a ~64px horizontal offset on ≥1280px viewports).
      */}
      <nav className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3 md:contents">
          <Link
            href="/"
            className="flex min-w-0 max-w-[min(140px,46vw)] shrink items-center gap-2 rounded-xl py-1 opacity-95 transition-opacity duration-300 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee] sm:max-w-none sm:shrink-0 sm:gap-3"
          >
            <Image
              src="/brand/logo.svg"
              alt="Lunatech agency"
              width={700}
              height={250}
              className="h-8 w-full max-w-full object-contain object-left sm:h-9 md:h-10"
              priority
              unoptimized
            />
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:hidden">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex min-h-11 min-w-0 w-full snap-x snap-mandatory scroll-ps-1 scroll-pe-1 gap-1 overflow