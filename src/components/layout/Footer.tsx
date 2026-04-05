import Image from "next/image";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

function SocialIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] text-zinc-400 transition-all duration-200 hover:border-cyan-400/35 hover:text-white hover:shadow-[0_0_22px_rgba(34,211,238,0.35)]">
      {children}
    </span>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="relative z-10">
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/35 to-transparent"
        aria-hidden
      />
      <div className="border-t border-white/[0.06] bg-[#05060a]/80 py-12 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4">
              <Link href="/" className="inline-block w-fit">
                <Image
                  src="/brand/logo.svg"
                  alt="Lunatech Agency"
                  width={180}
                  height={180}
                  className="h-8 w-auto opacity-95 drop-shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                  unoptimized
                />
              </Link>
              <p className="text-sm text-zinc-500">
                © {new Date().getFullYear()} Lunatech Agency. {t("rights")}
              </p>
            </div>

            <div>
              <p className="font-mono mb-3 text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                {t("follow")}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                >
                  <SocialIcon>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </SocialIcon>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <SocialIcon>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </SocialIcon>
                </a>
                <a
                  href="https://dribbble.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dribbble"
                >
                  <SocialIcon>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.993-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.27-.615-.555-1.23-.855-1.83-5.145 1.545-10.09 1.475-10.545 1.465-.003 1.055.14 2.095.415 3.095 0 0 .015-.005.048-.015.015 0 .03-.005.045-.005z" />
                    </svg>
                  </SocialIcon>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 border-t border-white/[0.06] pt-8 text-sm text-zinc-500">
            <a href="#services" className="transition-colors hover:text-white">
              {nav("services")}
            </a>
            <a href="#about" className="transition-colors hover:text-white">
              {nav("about")}
            </a>
            <a href="#portfolio" className="transition-colors hover:text-white">
              {nav("portfolio")}
            </a>
            <a href="#contact" className="transition-colors hover:text-white">
              {nav("contact")}
            </a>
            <span className="cursor-default">{t("privacy")}</span>
            <span className="cursor-default">{t("terms")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
