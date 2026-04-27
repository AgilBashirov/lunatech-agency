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
  "flex min-h-11 shrink-0 snap-start items-center rounded-full px-3 py-2 text-xs font-medium text-zinc-300 transition-colors duration-300 ease-out hover:bg-white/[0.04] hover:text-white md:min-h-0 md:rounded-none md:bg-transparent md:px-0 md:py-0 md:text-sm";

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
      <nav className="mx-auto flex max-w-6xl flex-col gap-2.5 px-3 py-3 sm:gap-3 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3 md:contents">
          <Link
            href="/"
            className="flex min-w-0 max-w-[min(152px,48vw)] shrink items-center gap-2 rounded-xl py-1 opacity-95 transition-opacity duration-300 ease-out hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee] sm:max-w-none sm:shrink-0 sm:gap-3"
          >
            <Image
              src="/brand/logo.svg"
              alt="Lunatech agency"
              width={256}
              height={52}
              className="h-8 w-full max-w-full object-contain object-left sm:h-10 sm:w-auto"
              priority
              unoptimized
            />
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:hidden">
            <LanguageSwitcher />
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
        </div>
      </nav>
    </header>
  );
}
