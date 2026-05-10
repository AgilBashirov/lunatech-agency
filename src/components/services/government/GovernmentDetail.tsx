import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { OverviewPackageSection } from "@/components/services/government/OverviewPackageSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";

/**
 * Bespoke detail page for the `government` service.
 *
 * Why bespoke: conversion-first layout with product cards, a single compact
 * "overview" block, and a subtle SVG backdrop — a deliberate divergence from
 * the shared editorial template the other four services use. The other
 * services still mount via `[slug]/page.tsx`'s default branch.
 *
 * The four section heading ids the e2e contract pins
 * (`svc-{hero,what-we-do,overview,cta}-heading`) are preserved, and the
 * hero `<section>` deliberately carries no `<a>` — the primary/secondary
 * CTAs sit in their own `<div>` band BELOW the hero so the link-free
 * invariant still holds for every detail page.
 *
 * Server component only — no client hooks. The `<Reveal>` wrappers are
 * client components that receive server-rendered children.
 */

/** Split a translated href like "/#contact" so the locale-aware <Link>
 *  rewrites the pathname (-> "/az/#contact") instead of treating the whole
 *  string as a hash-only path. */
function splitHref(raw: string): { pathname: string; hash?: string } {
  const [pathname, hash] = raw.split("#") as [string, string?];
  return { pathname: pathname || "/", hash };
}

export async function GovernmentDetail() {
  const t = await getTranslations("services.detail.government");

  const ctaPrimaryHref = splitHref(t("ctas.primaryHref"));
  const ctaSecondaryHref = splitHref(t("ctas.secondaryHref"));
  const finalCtaHref = splitHref(t("cta.ctaHref"));

  return (
    <div className="relative">
      <GovernmentBackdrop />

      {/* Hero — link-free per e2e contract; CTAs live in the band below. */}
      <Section
        ariaLabelledBy="svc-hero-heading"
        className="!pt-[var(--space-2)] md:!pt-[var(--space-4)]"
      >
        <div className="max-w-3xl">
          <span className="t-eyebrow">{t("hero.eyebrow")}</span>
          <h1
            id="svc-hero-heading"
            // `text-gradient-hero` paints the heading with the brand
            // purple→cyan gradient (per-page override of the post-R2 plain
            // detail-page heading rule).
            className="t-h2 mt-3 text-balance text-gradient-hero"
          >
            {t("hero.title")}
          </h1>
          <p className="mt-4 t-body text-text-secondary">{t("hero.lede")}</p>
        </div>
      </Section>

      {/* CTA band — sits visually under the hero but lives outside the hero
          <section>, so `section[aria-labelledby="svc-hero-heading"] a` count
          stays at 0 (preserves the universal e2e contract). */}
      <Container className="-mt-2 mb-2 md:-mt-4 md:mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={ctaPrimaryHref}>
            <Button>{t("ctas.primary")}</Button>
          </Link>
          <Link href={ctaSecondaryHref}>
            <Button variant="ghost">{t("ctas.secondary")}</Button>
          </Link>
        </div>
      </Container>

      {/* What we do — short prose lede + two product cards. */}
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
              <SimaCard
                brandLabel={t("intro.cards.sima.title")}
                description={t("intro.cards.sima.description")}
              />
              <ProductCard
                title={t("intro.cards.digital.title")}
                description={t("intro.cards.digital.description")}
                icon={<IconDigitalLogin />}
              />
            </div>
          </div>
        </Reveal>
      </ServiceSection>

      {/* Compact overview — replaces the previous three list sections
          (whatWeDo / whoFor / whyUs). Three GlassCard columns on md+, native
          <details> accordion on mobile. */}
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
// SİMA card uses the official brand mark on a white plate (the brand colours
// are navy + green, both unreadable on the dark page background — the plate
// is what makes them legible). Digital Login keeps an outline icon + text
// title until an official mark is provided.
// -----------------------------------------------------------------------------

function ProductCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="surface-glass relative overflow-hidden p-5">
      <span
        aria-hidden
        // Soft cyan glow on the icon chip — matches the existing
        // services-tile chip style without re-using its classname.
        className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-white/5 text-cyan-300/90 shadow-[var(--shadow-1),inset_0_1px_0_rgba(255,255,255,0.06),0_0_22px_rgba(34,211,238,0.18)]"
      >
        {icon}
      </span>
      <h3 className="mt-4 t-h3 text-foreground">{title}</h3>
      <p className="mt-2 t-body text-text-secondary">{description}</p>
    </div>
  );
}

function SimaCard({
  brandLabel,
  description,
}: {
  brandLabel: string;
  description: string;
}) {
  // White plate so the navy SİMA wordmark stays readable on the dark page.
  // The plate sits inside the H3 so screen readers announce the brand label
  // (via the SVG's aria-label) as the heading for the card.
  return (
    <div className="surface-glass relative overflow-hidden p-5">
      <h3>
        <SimaLogo
          ariaLabel={brandLabel}
          className="block h-10 w-auto"
          plateClassName="inline-flex items-center rounded-[var(--radius-md)] bg-white px-3 py-2 shadow-[var(--shadow-1),inset_0_1px_0_rgba(255,255,255,0.6)]"
        />
      </h3>
      <p className="mt-4 t-body text-text-secondary">{description}</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Decorative backdrop for the content area.
//
// One large fingerprint glyph in the cyan brand accent, anchored to the right
// edge and vertically centred BELOW the hero (top: 60%), so the hero zone is
// untouched. A soft radial glow sits behind the glyph for depth. Both layers
// are heavily blurred and very low-opacity so the page reads as "premium dark
// surface with a subtle identity motif" rather than a feature illustration.
// `pointer-events: none` and `aria-hidden` keep it out of input + a11y trees.
//
// Mobile: smaller size + lighter blur so the glyph stays readable at low DPRs
// and we don't blow the GPU on a 32px blur over a 70vh layer.
// -----------------------------------------------------------------------------

function GovernmentBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Soft cyan radial glow behind the glyph — adds depth without an icon */}
      <div
        className="absolute right-[-15%] top-[60%] h-[60vh] w-[60vh] -translate-y-1/2 rounded-full md:h-[80vh] md:w-[80vh]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(34,211,238,0.10) 0%, rgba(34,211,238,0.04) 38%, transparent 70%)",
        }}
      />

      {/* Single large fingerprint glyph — outline, blurred, breathing */}
      <div className="absolute right-[-18%] top-[60%] h-[60vh] w-[60vh] -translate-y-1/2 md:h-[80vh] md:w-[80vh]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.45"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="gov-bg-glyph h-full w-full text-[color:var(--neon-cyan)] opacity-[0.07] blur-[20px] md:blur-[34px]"
        >
          <path d="M5 13 C5 7.5 8 3 12 3 C16 3 19 7.5 19 13" />
          <path d="M7 13 C7 8.5 9.2 5 12 5 C14.8 5 17 8.5 17 13 V15" />
          <path d="M9 13 C9 9.5 10.5 7 12 7 C13.5 7 15 9.5 15 13 V15.5" />
          <path d="M11 13 C11 11.5 11.5 10 12 10 C12.5 10 13 11.5 13 13 V16 C13 17 12.5 18 12 19" />
          <path d="M8 21 C7 20 6.5 18.5 6 16" />
          <path d="M17.5 14 C17.5 16.5 16.8 18.5 15.5 20.5" />
        </svg>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Brand marks
// -----------------------------------------------------------------------------

function SimaLogo({
  ariaLabel,
  className,
  plateClassName,
}: {
  ariaLabel: string;
  className?: string;
  plateClassName?: string;
}) {
  // Official SİMA wordmark — supplied by the project owner. Brand colours are
  // fixed (navy + green) so we render it on a white plate (`plateClassName`)
  // to keep contrast on the dark page.
  return (
    <span className={plateClassName}>
      <svg
        viewBox="0 0 112 53"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel}
        className={className}
      >
        <path d="M38.0631 0H29.1816V5.30487H38.0631V0Z" fill="#1D204E" />
        <path d="M4.62028 23.2871C6.8227 25.4285 10.1144 27.1319 14.0763 27.1319C15.7521 27.1319 17.3321 26.5479 17.3321 25.392C17.3321 24.2362 16.0992 23.6521 13.2025 23.1168C8.35481 22.2164 0.969542 21.0484 0.969542 13.5899C0.969542 8.54058 5.09907 3.94141 13.1427 3.94141C17.9305 3.94141 22.2396 5.32846 25.5791 8.10256L20.8272 14.4903C18.2777 12.5192 14.986 11.5459 12.6519 11.5459C10.4495 11.5459 9.97072 12.3489 9.97072 13.1154C9.97072 14.2713 11.1557 14.685 14.2798 15.2203C19.1155 16.072 26.2853 17.4956 26.2853 24.3822C26.2853 30.9524 21.4975 34.7486 13.6215 34.7486C7.38527 34.7242 3.12408 32.8505 0 29.9912L4.62028 23.2871Z" fill="#1D204E" />
        <path d="M38.0631 7.60352H29.1816V34.1887H38.0631V7.60352Z" fill="#1D204E" />
        <path d="M42.8164 29.3105V34.1896H47.6162L42.8164 29.3105Z" fill="#1D204E" />
        <path d="M66.7793 34.1893H75.6608V19.4062L66.7793 28.4343V34.1893Z" fill="#1D204E" />
        <path d="M102.376 34.1899L101.239 30.3451H89.9873L88.8502 34.1899H79.2266L90.0352 4.39258H101.203L111.999 34.1899H102.376ZM95.601 12.3377L92.2615 22.8379H98.9406L95.601 12.3377Z" fill="#1D204E" />
        <path d="M75.6611 0.0121671V12.6051L66.7796 21.6332L54.427 34.1896L48.2147 27.8749H48.2267L42.8164 22.3753V9.7702V9.75803L54.427 21.5601L75.6492 0L75.6611 0.0121671Z" fill="#00B04D" />
        <path d="M79.9567 52.6235H77.5508V41.1256H79.9567V52.6235ZM77.9338 38.2176C78.1493 37.9986 78.4246 37.877 78.7477 37.877C79.0709 37.877 79.3462 37.9986 79.5617 38.2176C79.7771 38.4366 79.8968 38.7165 79.8968 39.045C79.8968 39.3735 79.8011 39.6534 79.5736 39.8724C79.3582 40.0914 79.0829 40.213 78.7597 40.213C78.4365 40.213 78.1612 40.0914 77.9458 39.8724C77.7303 39.6534 77.6106 39.3735 77.6106 39.045C77.6106 38.7165 77.7303 38.4366 77.9458 38.2176H77.9338Z" fill="#00B04D" />
        <path d="M80.1363 52.8049H77.3594V40.942H80.1363V52.8049ZM77.7304 52.4277H79.7653V41.3192H77.7304V52.4277ZM78.7718 40.4066C78.4007 40.4066 78.0895 40.2728 77.8262 40.0051C77.5629 39.7374 77.4312 39.4211 77.4312 39.0439C77.4312 38.8127 77.4791 38.5937 77.5868 38.4112H77.503L77.8023 38.0949C78.0656 37.8272 78.3768 37.6934 78.7479 37.6934C79.1189 37.6934 79.4301 37.8272 79.6935 38.0949C79.9568 38.3626 80.0885 38.6789 80.0885 39.0561C80.0885 39.4333 79.9568 39.7618 79.7174 40.0173C79.4541 40.2728 79.1309 40.4066 78.7718 40.4066ZM78.1973 38.2409L78.0895 38.3504C77.898 38.5451 77.8023 38.7762 77.8023 39.0439C77.8023 39.3116 77.898 39.5428 78.0895 39.7374C78.281 39.9321 78.5085 40.0294 78.7718 40.0294C79.0351 40.0294 79.2625 39.9321 79.4541 39.7374C79.6336 39.5549 79.7174 39.3238 79.7174 39.0439C79.7174 38.7762 79.6216 38.5451 79.4301 38.3504C79.2386 38.1557 79.0112 38.0584 78.7479 38.0584C78.5444 38.0584 78.3529 38.1192 78.1973 38.2409Z" fill="#00B04D" />
        <path d="M92.3212 47.4158C92.3212 47.0021 92.2254 46.6736 92.0219 46.4303C91.8185 46.1869 91.5192 46.0653 91.0883 46.0653C90.7532 46.0653 90.43 46.1626 90.1068 46.3573C89.8195 46.552 89.5682 46.771 89.3767 47.0265V52.6477H87.2101V47.3915C87.2101 46.9778 87.1144 46.6493 86.9109 46.406C86.7074 46.1626 86.4082 46.0409 85.9773 46.0409C85.6541 46.0409 85.3309 46.1504 85.0077 46.3329C84.7205 46.5276 84.4691 46.7466 84.2776 47.0021V52.599H82.123V44.2767H84.2776V45.3596C84.493 45.0676 84.8521 44.7756 85.3429 44.4957C85.8456 44.2159 86.3962 44.082 86.9468 44.082C87.5453 44.082 88.0361 44.2159 88.4191 44.4835C88.8141 44.7391 89.0774 45.1041 89.233 45.6029C89.4844 45.1892 89.8794 44.8242 90.3821 44.5322C90.9088 44.2402 91.4474 44.082 92.0459 44.082C92.8119 44.082 93.3985 44.2889 93.8294 44.7026C94.2483 45.1162 94.4518 45.7368 94.4518 46.5763V52.5869H92.2853V47.3307L92.3212 47.4158Z" fill="#00B04D" />
        <path d="M89.5563 52.8423H87.0187V47.4036C87.0187 47.0386 86.935 46.7466 86.7554 46.5398C86.5878 46.3451 86.3245 46.2477 85.9654 46.2477C85.6901 46.2477 85.3909 46.3329 85.0916 46.5154C84.8283 46.6858 84.6128 46.8804 84.4572 47.0873V52.8058H81.9316V44.1063H84.4572V44.9094C84.6727 44.7147 84.936 44.5322 85.2472 44.3618C85.7859 44.0698 86.3484 43.9238 86.9469 43.9238C87.5693 43.9238 88.096 44.0698 88.5269 44.3497C88.8621 44.5687 89.1134 44.8607 89.293 45.2379C89.5563 44.9215 89.8915 44.6417 90.2984 44.3983C90.873 44.082 91.4475 43.9238 92.046 43.9238C92.8599 43.9238 93.4943 44.155 93.9492 44.593C94.404 45.0432 94.6314 45.7002 94.6314 46.6006V52.8058H92.0939V47.0508C92.058 46.8561 91.9742 46.6858 91.8664 46.5519C91.6989 46.3573 91.4355 46.2599 91.0765 46.2599C90.7892 46.2599 90.4899 46.3451 90.1907 46.5276C89.9274 46.6979 89.7119 46.8926 89.5563 47.0994V52.8423ZM87.3898 52.4652H89.1852V46.9778L89.2212 46.9291C89.4127 46.6614 89.676 46.4303 89.9992 46.2112C90.3702 45.9922 90.7174 45.8827 91.0884 45.8827C91.5552 45.8827 91.9263 46.0287 92.1657 46.3086C92.3931 46.5884 92.5128 46.9534 92.5128 47.4158V48.0363L92.4769 47.9876V52.4286H94.2723V46.6006C94.2723 45.7976 94.0808 45.2379 93.6978 44.8607C93.3148 44.4835 92.7522 44.2888 92.046 44.2888C91.4954 44.2888 90.9927 44.4227 90.478 44.7147C89.9992 44.9945 89.6281 45.323 89.3887 45.7124L89.1733 46.0652L89.0536 45.6759C88.9219 45.2257 88.6706 44.8972 88.3115 44.6539C87.9404 44.4105 87.4856 44.2888 86.935 44.2888C86.4083 44.2888 85.8936 44.4227 85.4148 44.6782C84.96 44.9337 84.6128 45.2014 84.4094 45.4934L84.0742 45.9314V44.4835H82.2907V52.4286H84.0742V46.9534L84.1101 46.9048C84.3016 46.6371 84.565 46.4059 84.8881 46.1869C85.2592 45.9679 85.6063 45.8584 85.9534 45.8584C86.4203 45.8584 86.7913 46.0044 87.0307 46.2842C87.2581 46.5641 87.3778 46.9291 87.3778 47.3915V52.4652H87.3898Z" fill="#00B04D" />
        <path d="M99.9113 46.211H96.2246V44.3008H102.832V45.8825L99.0854 50.7129H102.904V52.6231H96.2246V50.9805L99.9113 46.211Z" fill="#00B04D" />
        <path d="M103.083 52.8045H96.0332V50.9186L99.5283 46.4046H96.0332V44.1172H103.012V45.9544L99.4685 50.5171H103.083V52.8045ZM96.4043 52.4273H102.712V50.8943H98.7024L102.64 45.8206V44.4944H96.4043V46.0274H100.294L96.4043 51.0524V52.4273Z" fill="#00B04D" />
        <path d="M109.594 51.759C109.307 52.0876 108.936 52.3431 108.481 52.5377C108.038 52.7324 107.548 52.8176 107.009 52.8176C106.554 52.8176 106.111 52.7081 105.668 52.5134C105.249 52.3066 104.866 52.0024 104.579 51.5887C104.292 51.1872 104.16 50.6883 104.16 50.0921C104.16 49.4838 104.292 48.9849 104.579 48.5956C104.866 48.1941 105.225 47.9021 105.644 47.7196C106.051 47.5249 106.506 47.4397 106.997 47.4397C107.56 47.4397 108.062 47.5249 108.517 47.6952C108.96 47.8656 109.319 48.1211 109.606 48.4496V47.2937C109.606 46.8679 109.439 46.515 109.116 46.2595C108.792 46.004 108.373 45.8823 107.811 45.8823C106.913 45.8823 106.111 46.2108 105.417 46.8679L104.603 45.4078C105.094 44.982 105.632 44.6534 106.267 44.4223C106.865 44.2033 107.5 44.0938 108.182 44.0938C109.247 44.0938 110.097 44.3371 110.755 44.8359C111.414 45.3348 111.761 46.15 111.761 47.2694V52.6472H109.606V51.7834H109.594V51.759ZM109.594 49.5568C109.427 49.3378 109.187 49.1553 108.888 49.0458C108.565 48.9241 108.242 48.8511 107.883 48.8511C107.44 48.8511 107.069 48.9728 106.782 49.1918C106.494 49.4108 106.339 49.7271 106.339 50.1043C106.339 50.4693 106.494 50.7735 106.782 51.0047C107.069 51.2237 107.428 51.3332 107.883 51.3332C108.242 51.3332 108.565 51.2602 108.888 51.1385C109.187 51.0168 109.427 50.8465 109.594 50.6275V49.5933V49.5568Z" fill="#00B04D" />
        <path d="M106.997 53.0003C106.518 53.0003 106.051 52.8908 105.585 52.6718C105.118 52.4407 104.723 52.1121 104.424 51.6741C104.112 51.2483 103.969 50.7251 103.969 50.0681C103.969 49.411 104.124 48.8879 104.424 48.462C104.735 48.0362 105.118 47.7198 105.561 47.5251C105.98 47.3305 106.458 47.2331 106.997 47.2331C107.572 47.2331 108.11 47.3183 108.589 47.5008C108.9 47.6225 109.176 47.7806 109.427 47.9875V47.2696C109.427 46.9046 109.283 46.6126 109.008 46.3814C108.721 46.1503 108.338 46.0407 107.823 46.0407C106.973 46.0407 106.219 46.3571 105.561 46.9776L105.393 47.1358L104.388 45.3351L104.507 45.2377C105.034 44.7754 105.597 44.4469 106.231 44.2157C106.829 43.9967 107.488 43.875 108.206 43.875C109.319 43.875 110.205 44.1305 110.887 44.6537C111.605 45.189 111.964 46.0651 111.964 47.2331V52.8057H109.439V52.1851C109.188 52.392 108.888 52.5745 108.553 52.7083C108.086 52.903 107.584 53.0003 106.997 53.0003ZM106.997 47.6103C106.518 47.6103 106.087 47.6955 105.716 47.8658C105.321 48.0362 104.986 48.316 104.723 48.681C104.46 49.0339 104.34 49.4962 104.34 50.0681C104.34 50.6399 104.471 51.0901 104.723 51.4551C104.986 51.8323 105.333 52.1243 105.74 52.3312C106.159 52.5258 106.566 52.6232 106.997 52.6232C107.536 52.6232 107.991 52.538 108.398 52.3677C108.828 52.1851 109.188 51.9418 109.451 51.6376L109.511 51.5768H109.798V52.4407H111.581V47.2575C111.581 46.2111 111.27 45.4446 110.66 44.9822C110.037 44.5077 109.223 44.2765 108.194 44.2765C107.524 44.2765 106.901 44.386 106.339 44.5929C105.788 44.7875 105.309 45.0674 104.855 45.4446L105.477 46.5639C106.159 45.9799 106.949 45.6879 107.823 45.6879C108.421 45.6879 108.888 45.8217 109.247 46.1016C109.618 46.4058 109.81 46.7951 109.81 47.2818V48.9244L109.487 48.5593C109.199 48.243 108.876 48.0118 108.469 47.8536C108.026 47.6955 107.536 47.6103 106.997 47.6103ZM107.883 51.516C107.38 51.516 106.985 51.3943 106.674 51.1509C106.339 50.8954 106.159 50.5304 106.159 50.1046C106.159 49.6665 106.339 49.3015 106.674 49.046C106.997 48.7905 107.404 48.6688 107.883 48.6688C108.242 48.6688 108.577 48.7297 108.948 48.8757C109.283 49.0095 109.559 49.2042 109.738 49.4597L109.774 49.5084V50.7008L109.738 50.7494C109.547 51.0049 109.283 51.1996 108.948 51.3213C108.577 51.4551 108.242 51.516 107.883 51.516ZM107.883 49.0339C107.488 49.0339 107.153 49.1312 106.889 49.338C106.65 49.5327 106.518 49.7882 106.518 50.1046C106.518 50.4087 106.65 50.6643 106.889 50.8468C107.141 51.0414 107.452 51.1388 107.883 51.1388C108.194 51.1388 108.493 51.0779 108.816 50.9563C109.068 50.8589 109.259 50.7251 109.403 50.5548V49.6179C109.259 49.4475 109.056 49.3137 108.804 49.2042C108.493 49.0947 108.194 49.0339 107.883 49.0339Z" fill="#00B04D" />
      </svg>
    </span>
  );
}

function IconDigitalLogin() {
  // Shield with key — communicates "secure login".
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M12 3 L20 6 V12 C20 16.5 16.5 20.5 12 21.5 C7.5 20.5 4 16.5 4 12 V6 Z" />
      <circle cx="10.25" cy="11.5" r="2" />
      <path d="M12.25 11.5 H17" />
      <path d="M15 11.5 V13.5" />
      <path d="M17 11.5 V13" />
    </svg>
  );
}
