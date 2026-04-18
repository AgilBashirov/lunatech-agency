"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

const labels: Record<string, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex rounded-full border border-white/[0.08] bg-[#05060a]/60 p-0.5 backdrop-blur-md"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={cn(
            "inline-flex min-h-11 min-w-10 cursor-pointer items-center justify-center rounded-full px-2 text-xs font-semibold tracking-wide transition-colors duration-300 ease-out sm:min-w-11 sm:px-2.5",
            loc === locale
              ? "bg-white/15 text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]"
              : "text-zinc-300 hover:text-white",
          )}
        >
          {labels[loc] ?? loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
