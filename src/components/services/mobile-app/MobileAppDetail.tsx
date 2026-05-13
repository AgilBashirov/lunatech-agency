import type { ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { OverviewPackageSection } from "@/components/services/mobile-app/OverviewPackageSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";

/**
 * Bespoke detail page for the `mobile-app` service. Mirrors the same pattern
 * `GovernmentDetail` and `WebExperienceDetail` use: kompakt 4-section layout
 * (hero + intro w/ visual cards + overview package + final CTA), link-free
 * hero, an `aria-hidden` decorative backdrop, and the four `svc-*-heading`
 * ids the e2e matrix pins to bespoke pages.
 */

function splitHref(raw: string): { pathname: string; hash?: string } {
  const [pathname, hash] = raw.split("#") as [string, string?];
  return { pathname: pathname || "/", hash };
}

export async function MobileAppDetail() {
  const t = await getTranslations("services.detail.mobile-app");

  const ctaPrimaryHref = splitHref(t("ctas.primaryHref"));
  const finalCtaHref = splitHref(t("cta.ctaHref"));

  return (
    <div className="relative">
      <MobileAppBackdrop />

      {/* Hero — link-free per e2e contract; CTA lives in the band below. */}
      <Section
        ariaLabelledBy="svc-hero-heading"
        className="!pt-[var(--space-2)] md:!pt-[var(--space-4)]"
      >
        <div className="max-w-3xl">
          <span className="t-eyebrow">{t("hero.eyebrow")}</span>
          <h1
            id="svc-hero-heading"
            className="t-h2 mt-3 text-balance text-gradient-hero"
          >
            {t("hero.title")}
          </h1>
          <p className="mt-4 t-body text-text-secondary">{t("hero.lede")}</p>
        </div>
      </Section>

      <Container className="-mt-2 mb-2 md:-mt-4 md:mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={ctaPrimaryHref}>
            <Button>{t("ctas.primary")}</Button>
          </Link>
        </div>
      </Container>

      {/* What we build — short prose lede + two visual product cards. */}
      <ServiceSection
        id="what-we-do"
        headingId="what-we-do"
        eyebrow={t("intro.eyebrow")}
        title={t("intro.title")}
        width="wide"
      >
        <Reveal>
          <div className="max-w-3xl">
            <p className="t-body text-text-secondary">{t("intro.lede")}</p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProductCard
                title={t("intro.cards.native.title")}
                description={t("intro.cards.native.description")}
                Mockup={NativeMockup}
              />
              <ProductCard
                title={t("intro.cards.cross.title")}
                description={t("intro.cards.cross.description")}
                Mockup={CrossPlatformMockup}
              />
            </div>
          </div>
        </Reveal>
      </ServiceSection>

      <OverviewPackageSection />

      {/* CTA — keeps svc-cta-heading. Anchor must be present (e2e). */}
      <ServiceSection
        id="ready"
        headingId="cta"
        eyebrow={t("cta.eyebrow")}
        title={t("cta.title")}
        width="narrow"
        className="!scroll-mt-0"
      >
        <Reveal>
          <p className="t-body text-text-secondary">{t("cta.lede")}</p>
        </Reveal>
        <div className="mt-6">
          <Link href={finalCtaHref}>
            <Button type="button">{t("cta.ctaLabel")}</Button>
          </Link>
        </div>
      </ServiceSection>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Product cards (intro section) — abstract inline-SVG mockups of an iOS-style
// phone frame (native card) and a paired iOS+Android frame (cross-platform
// card). Tokens match the rest of the bespoke pages.
// -----------------------------------------------------------------------------

function ProductCard({
  title,
  description,
  Mockup,
}: {
  title: string;
  description: string;
  Mockup: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="surface-glass relative overflow-hidden p-5">
      <Mockup
        aria-hidden
        className="block h-32 w-full rounded-[var(--radius-md)] border border-white/[0.06] bg-[#05060a]/40"
      />
      <h3 className="t-h3 mt-5 text-foreground">{title}</h3>
      <p className="mt-2 t-body text-text-secondary">{description}</p>
    </div>
  );
}

function NativeMockup(props: SVGProps<SVGSVGElement>) {
  // Single phone frame, generous bezels, status bar + content rows + tab bar.
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" {...props}>
      {/* phone outline (centered, portrait) */}
      <rect
        x="125"
        y="14"
        width="70"
        height="152"
        rx="14"
        className="fill-white/[0.04] stroke-white/15"
        strokeWidth="1.2"
      />
      {/* notch / status pill */}
      <rect x="146" y="19" width="28" height="4" rx="2" className="fill-white/25" />
      {/* hero block */}
      <rect
        x="131"
        y="32"
        width="58"
        height="22"
        rx="3"
        className="fill-[color:var(--neon-cyan)]/30 stroke-[color:var(--neon-cyan)]/55"
        strokeWidth="0.9"
      />
      {/* content rows */}
      <rect x="131" y="60" width="44" height="5" rx="2" className="fill-white/25" />
      <rect x="131" y="69" width="52" height="4" rx="2" className="fill-white/12" />
      <rect x="131" y="78" width="48" height="4" rx="2" className="fill-white/12" />
      {/* tile row */}
      <rect x="131" y="92" width="26" height="22" rx="3" className="fill-white/[0.05]" />
      <rect x="163" y="92" width="26" height="22" rx="3" className="fill-white/[0.05]" />
      {/* tab bar */}
      <rect x="129" y="148" width="62" height="14" rx="3" className="fill-white/[0.04]" />
      <circle cx="138" cy="155" r="1.6" className="fill-[color:var(--neon-cyan)]" />
      <circle cx="150" cy="155" r="1.4" className="fill-white/35" />
      <circle cx="162" cy="155" r="1.4" className="fill-white/35" />
      <circle cx="174" cy="155" r="1.4" className="fill-white/35" />
      {/* home indicator */}
      <rect x="148" y="162" width="24" height="1.6" rx="0.8" className="fill-white/30" />
      {/* "iOS" / "Android" labels flanking */}
      <text
        x="40"
        y="92"
        className="fill-white/40"
        style={{ font: "600 11px system-ui, -apple-system, sans-serif" }}
      >
        iOS
      </text>
      <text
        x="232"
        y="92"
        className="fill-white/40"
        style={{ font: "600 11px system-ui, -apple-system, sans-serif" }}
      >
        Android
      </text>
    </svg>
  );
}

function CrossPlatformMockup(props: SVGProps<SVGSVGElement>) {
  // Two phone frames side-by-side with a shared "one codebase" bracket above —
  // visual cue for cross-platform delivery.
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" {...props}>
      {/* shared codebase bracket */}
      <path
        d="M70 22 L70 14 L250 14 L250 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-[color:var(--neon-cyan)]/60"
        strokeLinecap="round"
      />
      <text
        x="160"
        y="11"
        textAnchor="middle"
        className="fill-[color:var(--neon-cyan)]/80"
        style={{ font: "600 8px system-ui, -apple-system, sans-serif" }}
      >
        {"</>"}
      </text>
      {/* phone A (left) */}
      <rect
        x="80"
        y="28"
        width="60"
        height="138"
        rx="11"
        className="fill-white/[0.04] stroke-white/15"
        strokeWidth="1.1"
      />
      <rect x="98" y="32" width="24" height="3" rx="1.5" className="fill-white/25" />
      <rect
        x="85"
        y="44"
        width="50"
        height="20"
        rx="3"
        className="fill-[color:var(--neon-cyan)]/22"
      />
      <rect x="85" y="70" width="40" height="4" rx="2" className="fill-white/20" />
      <rect x="85" y="78" width="44" height="3.5" rx="1.5" className="fill-white/12" />
      <rect x="85" y="86" width="36" height="3.5" rx="1.5" className="fill-white/12" />
      <rect x="85" y="100" width="22" height="20" rx="3" className="fill-white/[0.05]" />
      <rect x="113" y="100" width="22" height="20" rx="3" className="fill-white/[0.05]" />
      <rect x="84" y="148" width="52" height="12" rx="3" className="fill-white/[0.04]" />
      <text
        x="110"
        y="180"
        textAnchor="middle"
        className="fill-white/40"
        style={{ font: "600 8px system-ui, -apple-system, sans-serif" }}
      >
        iOS
      </text>
      {/* phone B (right) */}
      <rect
        x="180"
        y="28"
        width="60"
        height="138"
        rx="11"
        className="fill-white/[0.04] stroke-white/15"
        strokeWidth="1.1"
      />
      <rect x="198" y="32" width="24" height="3" rx="1.5" className="fill-white/25" />
      <rect
        x="185"
        y="44"
        width="50"
        height="20"
        rx="3"
        className="fill-[color:var(--neon-cyan)]/22"
      />
      <rect x="185" y="70" width="40" height="4" rx="2" className="fill-white/20" />
      <rect x="185" y="78" width="44" height="3.5" rx="1.5" className="fill-white/12" />
      <rect x="185" y="86" width="36" height="3.5" rx="1.5" className="fill-white/12" />
      <rect x="185" y="100" width="22" height="20" rx="3" className="fill-white/[0.05]" />
      <rect x="213" y="100" width="22" height="20" rx="3" className="fill-white/[0.05]" />
      <rect x="184" y="148" width="52" height="12" rx="3" className="fill-white/[0.04]" />
      <text
        x="210"
        y="180"
        textAnchor="middle"
        className="fill-white/40"
        style={{ font: "600 8px system-ui, -apple-system, sans-serif" }}
      >
        Android
      </text>
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Decorative backdrop — single phone glyph anchored bottom-right, behind a
// soft cyan radial glow. Same structure as the web-experience / government
// backdrops (path replaced; everything else identical) so the three bespoke
// pages share a visual rhythm.
// -----------------------------------------------------------------------------

function MobileAppBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute right-[-15%] top-[60%] h-[60vh] w-[60vh] -translate-y-1/2 rounded-full md:h-[80vh] md:w-[80vh]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(34,211,238,0.10) 0%, rgba(34,211,238,0.04) 38%, transparent 70%)",
        }}
      />
      <div className="absolute right-[-18%] top-[60%] h-[60vh] w-[60vh] -translate-y-1/2 md:h-[80vh] md:w-[80vh]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.45"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-full w-full text-[color:var(--neon-cyan)] opacity-[0.07] blur-[20px] md:blur-[34px]"
        >
          {/* phone outline */}
          <rect x="7" y="3" width="10" height="18" rx="2.2" />
          {/* speaker slot */}
          <path d="M10.5 5.5 H13.5" />
          {/* home indicator */}
          <circle cx="12" cy="18.5" r="0.5" />
          {/* content lines */}
          <path d="M9 9 H15" />
          <path d="M9 11.5 H14" />
          <path d="M9 14 H14.5" />
        </svg>
      </div>
    </div>
  );
}
