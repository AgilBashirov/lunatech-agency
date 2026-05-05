import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import type { ServiceSlug } from "@/lib/services";

/**
 * "Ready to start?" — simplified final CTA (revised spec R5.6).
 *
 * Critical changes vs the old §3.8:
 * - Drop the centred GlassCard frame — the CTA is now a left-aligned prose
 *   block with a single primary `Button`, no card chrome, no inset border.
 * - Restore the default primary `Button` (full glow) — the simplified page
 *   lacks the GlassCard's visual weight, so the button needs to carry the
 *   focal weight itself. (No `subtleGlow`.)
 *
 * Reveal: ONE around the section header. Button NOT inside the Reveal so it
 * remains an immediate keyboard target.
 *
 * Heading id: `svc-cta-heading` preserved for backwards-compat.
 */
export async function ServiceCTASection({ slug }: { slug: ServiceSlug }) {
  const t = await getTranslations(`services.detail.${slug}.cta`);

  const ctaLabel = t("ctaLabel");
  // i18n owns the CTA *label*; the destination is hardcoded as a hash route
  // on the home page. Split into `{ pathname, hash }` so the locale-aware
  // `<Link>` rewrites the pathname with the active locale (`/en/#contact`,
  // `/az/#contact`, …). A raw `<a>` would strip the locale.
  const rawCtaHref = t.has("ctaHref") ? t("ctaHref") : "/#contact";
  const [ctaPathname, ctaHash] = rawCtaHref.split("#") as [string, string?];

  return (
    <ServiceSection
      id="ready"
      // Legacy id preserved for backwards-compat with e2e tests.
      headingId="cta"
      eyebrow={t("eyebrow")}
      title={t("title")}
      width="narrow"
      // Match Contact.tsx: this section is the scroll anchor for `#cta`/
      // `#contact` jumps, so cancel the global scroll-margin to land flush.
      className="!scroll-mt-0"
    >
      <Reveal>
        <p className="t-body text-text-secondary">{t("lede")}</p>
      </Reveal>
      <div className="mt-6">
        <Link href={{ pathname: ctaPathname || "/", hash: ctaHash }}>
          <Button type="button">{ctaLabel}</Button>
        </Link>
      </div>
    </ServiceSection>
  );
}
