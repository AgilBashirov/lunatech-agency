import type { ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import {
  iconClass,
  iconWrapClass,
  iconWrapStyle,
} from "@/components/services/detail/iconChip";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type OverviewCard = {
  key: "technical" | "whoFor" | "whyUs";
  title: string;
  items: ReadonlyArray<string>;
  Icon: IconComponent;
};

/**
 * "Xidmət paketi bir baxışda" — replaces the three sequential list sections
 * (whatWeDo / whoFor / whyUs) with one compact, conversion-oriented block.
 *
 * Layout:
 *  - md+ : three equal `GlassCard` columns (`md:grid-cols-3 gap-5`)
 *  - < md: native `<details>` accordion with the first item open by default,
 *          chevron rotation handled purely in CSS via `[&[open]_.acc-chev]:rotate-180`
 *
 * Server component only. Mobile interactivity uses the platform's built-in
 * `<details>` toggle so no `"use client"` boundary, no extra JS, no a11y wiring.
 */
export async function OverviewPackageSection() {
  const t = await getTranslations("services.detail.government.overview");

  const cards: ReadonlyArray<OverviewCard> = [
    {
      key: "technical",
      title: t("cards.technical.title"),
      items: t.raw("cards.technical.items") as ReadonlyArray<string>,
      Icon: IconShieldCheck,
    },
    {
      key: "whoFor",
      title: t("cards.whoFor.title"),
      items: t.raw("cards.whoFor.items") as ReadonlyArray<string>,
      Icon: IconUsers,
    },
    {
      key: "whyUs",
      title: t("cards.whyUs.title"),
      items: t.raw("cards.whyUs.items") as ReadonlyArray<string>,
      Icon: IconSparkles,
    },
  ];

  return (
    <ServiceSection
      id="overview"
      headingId="overview"
      eyebrow={t("eyebrow")}
      title={t("title")}
      width="wide"
    >
      <Reveal>
        <div className="hidden md:grid md:grid-cols-3 md:gap-5">
          {cards.map((card) => (
            <OverviewCardDesktop key={card.key} card={card} />
          ))}
        </div>
        <div className="space-y-3 md:hidden">
          {cards.map((card, i) => (
            <OverviewAccordionItem
              key={card.key}
              card={card}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </Reveal>
    </ServiceSection>
  );
}

function OverviewCardDesktop({ card }: { card: OverviewCard }) {
  const { title, items, Icon } = card;
  return (
    <GlassCard className="h-full">
      <span aria-hidden className={iconWrapClass} style={iconWrapStyle}>
        <Icon className={iconClass} />
      </span>
      <h3 className="t-h3 text-foreground">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-text-secondary">
            <span
              aria-hidden
              className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function OverviewAccordionItem({
  card,
  defaultOpen,
}: {
  card: OverviewCard;
  defaultOpen: boolean;
}) {
  const { title, items, Icon } = card;
  return (
    <details
      open={defaultOpen}
      className={cn(
        "surface-glass group overflow-hidden",
        // Rotate the chevron when the parent <details> is open.
        "[&[open]_.acc-chev]:rotate-180",
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer select-none items-center gap-3 p-4",
          // Hide the default disclosure marker (▶) cross-browser.
          "list-none [&::-webkit-details-marker]:hidden",
          // Focus ring for keyboard users — uses the same neon-cyan token.
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon-cyan)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        )}
      >
        <span
          aria-hidden
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.08] bg-[#05060a]/80"
          style={{
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-1), var(--shadow-inset-hairline)",
          }}
        >
          <Icon className="h-5 w-5 text-[var(--neon-cyan)]" />
        </span>
        <h3 className="t-h3 flex-1 text-foreground">{title}</h3>
        <ChevronDown
          aria-hidden
          className="acc-chev h-5 w-5 shrink-0 text-text-secondary transition-transform duration-300"
        />
      </summary>
      <div className="px-4 pb-4">
        <ul className="space-y-3 border-t border-[color:var(--card-border)] pt-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-text-secondary">
              <span
                aria-hidden
                className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

// -----------------------------------------------------------------------------
// Inline SVG icons — match the codebase convention (e.g. `IconDigitalLogin` in
// `GovernmentDetail.tsx`) rather than pulling in a runtime icon library.
// -----------------------------------------------------------------------------

function IconShieldCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 3 L20 6 V12 C20 16.5 16.5 20.5 12 21.5 C7.5 20.5 4 16.5 4 12 V6 Z" />
      <path d="M8.5 12 L11 14.5 L15.75 9.75" />
    </svg>
  );
}

function IconUsers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 19.5 C3.5 16.5 6 14.5 9 14.5 C12 14.5 14.5 16.5 14.5 19.5" />
      <circle cx="16.75" cy="9" r="2.5" />
      <path d="M14.75 14.5 C18 14.5 20.5 16 20.5 18.75" />
    </svg>
  );
}

function IconSparkles(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 3.5 L13.4 8.6 L18.5 10 L13.4 11.4 L12 16.5 L10.6 11.4 L5.5 10 L10.6 8.6 Z" />
      <path d="M18 16 L18.8 18.2 L21 19 L18.8 19.8 L18 22 L17.2 19.8 L15 19 L17.2 18.2 Z" />
    </svg>
  );
}

function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M6 9 L12 15 L18 9" />
    </svg>
  );
}
