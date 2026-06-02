/**
 * Admin — Messages locale selection page
 *
 * Server component. Displays three cards — one per supported locale.
 * Each card links to the full messages editor for that locale.
 */

import Link from "next/link";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type LocaleCard = {
  locale: "az" | "en" | "ru";
  language: string;
  flag: string;
};

const LOCALE_CARDS: LocaleCard[] = [
  { locale: "az", language: "Azərbaycanca", flag: "🇦🇿" },
  { locale: "en", language: "English", flag: "🇬🇧" },
  { locale: "ru", language: "Русский", flag: "🇷🇺" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminMessagesPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Məzmun</h1>
        <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
          Saytın interfeys mətnlərini locale üzrə redaktə edin.
          Dəyişikliklər yadda saxlanıldıqda canlı saytda dərhal aktiv olur.
        </p>
      </div>

      {/* Locale cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LOCALE_CARDS.map(({ locale, language, flag }) => (
          <Link
            key={locale}
            href={`/admin/messages/${locale}`}
            className="group flex flex-col gap-2 rounded-xl border p-5 transition-colors"
            style={{
              background: "#1a1a1a",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <span className="text-2xl" aria-hidden="true">
              {flag}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{language}</p>
              <p
                className="text-xs mt-0.5 uppercase tracking-wider font-mono"
                style={{ color: "rgba(244,244,245,0.35)" }}
              >
                {locale}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
