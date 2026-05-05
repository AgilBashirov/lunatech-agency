import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { ServiceSlug } from "@/lib/services";

/**
 * Final CTA — `Contact.tsx` rhythm: eyebrow → centred H2 → static GlassCard
 * containing the lede + a single primary `<Button>` linking to `/#contact`
 * (spec §3.8). We do NOT duplicate the form here; one CTA endpoint per page.
 */
export async function ServiceCTA({ slug }: { slug: ServiceSlug }) {
  const t = await getTranslations(`services.detail.${slug}.cta`);

  const ctaLabel = t("ctaLabel");
  // i18n owns the CTA *label*, but the destination is hardcoded as a hash
  // route on the home page. Split the value into `{ pathname, hash }` so the
  // locale-aware `<Link>` rewrites the pathname with the active locale
  // (`/en/#contact`, `/az/#contact`, …). A raw `<a href="/#contact">` would
  // strip the locale and dump users on the default-locale home (B1).
  const rawCtaHref = t.has("ctaHref") ? t("ctaHref") : "/#contact";
  const [ctaPathname, ctaHash] = rawCtaHref.split("#") as [string, string?];

  return (
    <Section
      id="cta"
      ariaLabelledBy="svc-cta-heading"
      // Match Contact.tsx: this section is the scroll anchor for `#cta`/`#contact`
      // jumps, so cancel the global scroll-margin to land flush with the top.
      className="!scroll-mt-0"
    >
      <div className="mx-auto w-full max-w-lg text-center">
        <Reveal>
          <span className="t-eyebrow">{t("eyebrow")}</span>
          <h2
            id="svc-cta-heading"
            className="mt-3 t-h2 text-foreground"
          >
            {t("title")}
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <GlassCard
            interactive={false}
            disableBackdropBlur
            className="mt-10 border-white/[0.12] bg-[#0b0f1a]/96 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            <div className="flex flex-col items-center gap-6">
              <p className="t-body text-text-secondary">{t("lede")}</p>
              <Link
                href={{ pathname: ctaPathname || "/", hash: ctaHash }}
              >
                <Button type="button" subtleGlow>
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </Section>
  );
}
