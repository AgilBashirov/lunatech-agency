import type { ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { OverviewPackageSection } from "@/components/services/web-experience/OverviewPackageSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";

/**
 * Bespoke detail page for the `web-experience` service. Mirrors the same
 * pattern `GovernmentDetail` introduced: kompakt 4-section layout (hero +
 * intro w/ visual cards + overview package + final CTA), link-free hero, an
 * `aria-hidden` decorative backdrop, and the four `svc-*-heading` ids the e2e
 * matrix pins to bespoke pages.
 */

function splitHref(raw: string): { pathname: string; hash?: string } {
  const [pathname, hash] = raw.split("#") as [string, string?];
  return { pathname: pathname || "/", hash };
}

export async function WebExperienceDetail() {
  const t = await getTranslations("services.detail.web-experience");

  const ctaPrimaryHref = splitHref(t("ctas.primaryHref"));
  const finalCtaHref = splitHref(t("cta.ctaHref"));

  return (
    <div className="relative">
      <WebExperienceBackdrop />

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

      {/* CTA band — sits visually under the hero but lives outside the hero
          <section>, so `section[aria-labelledby="svc-hero-heading"] a` stays
          at 0 (preserves the universal e2e link-free hero invariant). */}
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
                title={t("intro.cards.marketing.title")}
                description={t("intro.cards.marketing.description")}
                Mockup={MarketingMockup}
              />
              <ProductCard
                title={t("intro.cards.platform.title")}
                description={t("intro.cards.platform.description")}
                Mockup={PlatformMockup}
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
// Product cards (intro section)
//
// Abstract inline-SVG mockups — there's no brand mark to plate here (unlike
// government's SİMA / Digital Login wordmarks), so each card carries a
// monochrome mockup illustrating what the product looks like. Tokens
// (`surface-glass`, `--neon-cyan`) match the rest of the site so the cards
// feel native to the design system.
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

function MarketingMockup(props: SVGProps<SVGSVGElement>) {
  // Browser chrome + hero stripe + content rows + CTA pill.
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" {...props}>
      {/* 3 traffic dots */}
      <circle cx="22" cy="22" r="3" className="fill-white/25" />
      <circle cx="32" cy="22" r="3" className="fill-white/25" />
      <circle cx="42" cy="22" r="3" className="fill-white/25" />
      {/* URL bar */}
      <rect x="56" y="17" width="240" height="10" rx="5" className="fill-white/[0.05]" />
      {/* hero stripe */}
      <rect
        x="20"
        y="42"
        width="280"
        height="48"
        rx="6"
        className="fill-[color:var(--neon-cyan)]/15 stroke-[color:var(--neon-cyan)]/40"
        strokeWidth="1"
      />
      {/* hero headline + sub */}
      <rect x="30" y="54" width="160" height="8" rx="3" className="fill-white/30" />
      <rect x="30" y="68" width="120" height="6" rx="3" className="fill-white/15" />
      {/* content rows */}
      <rect x="20" y="100" width="180" height="8" rx="3" className="fill-white/20" />
      <rect x="20" y="116" width="240" height="6" rx="3" className="fill-white/12" />
      <rect x="20" y="130" width="200" height="6" rx="3" className="fill-white/12" />
      {/* CTA pill */}
      <rect
        x="20"
        y="148"
        width="80"
        height="16"
        rx="8"
        className="fill-[color:var(--neon-cyan)]/40"
      />
    </svg>
  );
}

function PlatformMockup(props: SVGProps<SVGSVGElement>) {
  // Sidebar + chart bars + tile grid — the visual cue for "dashboard / SaaS".
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" {...props}>
      {/* sidebar */}
      <rect x="20" y="22" width="64" height="138" rx="6" className="fill-white/[0.05]" />
      {/* active nav item */}
      <rect
        x="28"
        y="34"
        width="48"
        height="10"
        rx="3"
        className="fill-[color:var(--neon-cyan)]/45"
      />
      <rect x="28" y="50" width="48" height="6" rx="3" className="fill-white/18" />
      <rect x="28" y="62" width="48" height="6" rx="3" className="fill-white/18" />
      <rect x="28" y="74" width="48" height="6" rx="3" className="fill-white/18" />
      <rect x="28" y="86" width="48" height="6" rx="3" className="fill-white/18" />
      {/* main: chart card */}
      <rect x="96" y="22" width="204" height="68" rx="6" className="fill-white/[0.04]" />
      <rect x="106" y="64" width="14" height="18" className="fill-[color:var(--neon-cyan)]/50" />
      <rect x="126" y="54" width="14" height="28" className="fill-[color:var(--neon-cyan)]/65" />
      <rect x="146" y="44" width="14" height="38" className="fill-[color:var(--neon-cyan)]/80" />
      <rect x="166" y="36" width="14" height="46" className="fill-[color:var(--neon-cyan)]" />
      <rect x="186" y="50" width="14" height="32" className="fill-[color:var(--neon-cyan)]/65" />
      {/* tile grid */}
      <rect x="96" y="100" width="96" height="60" rx="6" className="fill-white/[0.04]" />
      <rect x="204" y="100" width="96" height="60" rx="6" className="fill-white/[0.04]" />
      <rect x="106" y="114" width="60" height="6" rx="3" className="fill-white/22" />
      <rect x="106" y="128" width="40" height="14" rx="3" className="fill-[color:var(--neon-cyan)]/45" />
      <rect x="214" y="114" width="60" height="6" rx="3" className="fill-white/22" />
      <rect x="214" y="128" width="40" height="14" rx="3" className="fill-white/15" />
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Decorative backdrop — single browser-window glyph anchored bottom-right,
// blurred and very low-opacity, behind a soft cyan radial glow. Same structure
// as `GovernmentBackdrop` (path replaced; everything else identical) so the
// two bespoke pages feel visually related rather than ad-hoc.
// -----------------------------------------------------------------------------

function WebExperienceBackdrop() {
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
          {/* browser frame */}
          <rect x="3" y="5" width="18" height="14" rx="0.8" />
          {/* tab-bar separator */}
          <path d="M3 8.5 H21" />
          {/* 3 traffic dots */}
          <circle cx="4.7" cy="6.7" r="0.32" />
          <circle cx="6" cy="6.7" r="0.32" />
          <circle cx="7.3" cy="6.7" r="0.32" />
          {/* address bar */}
          <path d="M10 6 H19 V7.4 H10 Z" />
          {/* cursor arrow inside viewport */}
          <path d="M12.4 11.6 L16.6 13.6 L14.2 14.1 L13.6 16.6 Z" />
        </svg>
      </div>
    </div>
  );
}
