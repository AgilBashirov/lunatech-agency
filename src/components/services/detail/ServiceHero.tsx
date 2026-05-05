import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { ServiceSlug } from "@/lib/services";

/**
 * Service detail hero. Mirrors the home `Hero.tsx` text-column rhythm
 * (eyebrow → gradient H1 → lede → CTA pair) without the 3D moon column —
 * per spec §3.1 the detail page does not have a companion column, so the
 * H1 size cap stays at `md:text-6xl` to avoid an orphaned oversized title.
 */
export async function ServiceHero({ slug }: { slug: ServiceSlug }) {
  const t = await getTranslations(`services.detail.${slug}.hero`);

  const eyebrow = t("eyebrow");
  const title = t("title");
  const lede = t("lede");
  const ctaLabel = t("ctaLabel");
  // i18n still owns the CTA *label*, but the destination is hardcoded as a
  // hash route on the home page. We split `t("ctaHref")` (e.g. `/#contact`)
  // into `{ pathname, hash }` so the locale-aware `<Link>` can rewrite the
  // pathname with the active locale (yielding `/en/#contact`, `/az/#contact`,
  // etc.). A raw `<a href="/#contact">` would strip the locale and bounce the
  // user to the default-locale home (B1).
  const rawCtaHref = t("ctaHref");
  const [ctaPathname, ctaHash] = rawCtaHref.split("#") as [string, string?];
  // Optional secondary CTA — `getTranslations` throws on missing keys, so we
  // probe via `t.has` (next-intl v4) before rendering.
  const hasSecondary = t.has("ctaSecondaryLabel");
  const ctaSecondaryLabel = hasSecondary ? t("ctaSecondaryLabel") : null;
  const ctaSecondaryHref = t.has("ctaSecondaryHref")
    ? t("ctaSecondaryHref")
    : "#how-it-works";

  return (
    <Section
      id="top"
      ariaLabelledBy="svc-hero-heading"
      className="!pt-[var(--gutter-section)]"
    >
      <Reveal>
        <div className="mx-auto max-w-xl text-center md:mx-0 md:max-w-2xl md:text-left">
          <span className="t-eyebrow">{eyebrow}</span>
          <h1
            id="svc-hero-heading"
            className="mt-3 text-gradient-hero text-balance break-words text-4xl font-bold leading-[1.05] tracking-tight drop-shadow-[0_4px_28px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl"
          >
            {title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-text-secondary md:text-lg">
            {lede}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link
              href={{ pathname: ctaPathname || "/", hash: ctaHash }}
            >
              <Button type="button">{ctaLabel}</Button>
            </Link>
            {ctaSecondaryLabel ? (
              <a href={ctaSecondaryHref}>
                <Button type="button" variant="ghost">
                  {ctaSecondaryLabel}
                </Button>
              </a>
            ) : null}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
