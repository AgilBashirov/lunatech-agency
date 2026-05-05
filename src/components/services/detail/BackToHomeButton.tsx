import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/**
 * Subtle, low-chrome navigation back to the home page (revised spec R3.1).
 *
 * Used twice on every detail page — at the top above the page header and at
 * the bottom between the final section and the footer. The component is a
 * locale-aware `Link` (raw `<a>` would strip the locale and bounce users to
 * the default-locale home), styled as quiet text-with-arrow rather than a
 * `Button` (the gradient pill would compete with the simplified design).
 *
 * Token-only styling:
 * - typography: `t-meta` (existing class — mono, 0.75rem, --text-tertiary)
 * - hover color: `hover:text-foreground` (existing token)
 * - arrow micro-translate: `group-hover:-translate-x-0.5` mirrors the
 *   `cs-arrow-prev:hover` pattern in globals.css
 * - focus ring: handled by the global `a:focus-visible` rule — NO per-element
 *   override (utilities would shadow the global selector)
 */
type BackToHomeButtonProps = {
  /** "top" tightens spacing & scales down a hair; "bottom" centres horizontally on mobile. */
  placement?: "top" | "bottom";
  className?: string;
};

export async function BackToHomeButton({
  placement = "top",
  className,
}: BackToHomeButtonProps) {
  const t = await getTranslations("nav");
  const label = t("backToHome");

  // Spec R3.1 placement spec: top has tight rhythm, bottom has roomier
  // padding and centres on mobile. Both wrap in `Container` so the affordance
  // aligns to the page gutter.
  const wrapPadding =
    placement === "top"
      ? "pt-6 sm:pt-8"
      : "py-10 md:py-12";
  const wrapAlign =
    placement === "bottom" ? "flex justify-center md:justify-start" : "";

  return (
    <div className={cn(wrapPadding, className)}>
      <Container className={wrapAlign}>
        <Link
          href="/"
          className="group t-meta inline-flex items-center gap-2 text-text-tertiary transition-colors duration-200 ease-out hover:text-foreground"
        >
          <svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 ease-out group-hover:-translate-x-0.5"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          <span>{label}</span>
        </Link>
      </Container>
    </div>
  );
}
