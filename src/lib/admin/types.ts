// ---------------------------------------------------------------------------
// Admin domain types
// ---------------------------------------------------------------------------

/** Decoded admin JWT/session payload stored in the cookie. */
export type AdminSession = {
  username: string;
  exp: number; // Unix timestamp (seconds)
};

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

/**
 * Site-wide settings managed from `/admin/settings`.
 *
 * Every value follows the same rule: **empty string = the element is not
 * rendered at all**. That keeps a half-configured site from showing dead
 * links or an empty contact block.
 */
export type SiteSettings = {
  social: {
    x: string;
    linkedin: string;
    dribbble: string;
    instagram: string;
    facebook: string;
    youtube: string;
    github: string;
  };
  contact: {
    /** Display form, e.g. "+994 50 123 45 67". Dialled via a `tel:` link with
     *  separators stripped — see `telHref()` in `@/lib/contact`. */
    phone: string;
    /** Digits only or `+`-prefixed; turned into a `https://wa.me/...` link. */
    whatsapp: string;
    email: string;
    /** Free-form postal address shown in the footer. */
    address: string;
  };
};

/**
 * Shipped defaults. `/admin/settings` overrides these once saved — including
 * back to an empty string, which hides the element again.
 *
 * Tracking/session parameters are deliberately stripped from the social URLs:
 * `?viewAsMember=true` is LinkedIn's own preview mode and `?igsh=…` is an
 * Instagram share token. Neither belongs in a link shown to the public.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  social: {
    x: "",
    linkedin: "https://www.linkedin.com/company/lunatech-agency/",
    dribbble: "",
    instagram: "https://www.instagram.com/lunatech.az",
    facebook: "",
    youtube: "",
    github: "",
  },
  contact: {
    phone: "+994 51 505 21 50",
    // Same line as `phone` — change here or in /admin/settings if WhatsApp
    // should reach a different number.
    whatsapp: "+994 51 505 21 50",
    email: "info@lunatech.az",
    // Not supplied yet; the footer omits the address row while this is empty.
    address: "",
  },
};

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

/** Per-locale text content for a blog post. */
export type BlogLocaleContent = {
  title: string;
  excerpt: string;
  content: string; // markdown
};

/** A single blog post with multilingual content. */
export type BlogPost = {
  id: string;
  slug: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  tags: string[];
  az: BlogLocaleContent;
  en: BlogLocaleContent;
  ru: BlogLocaleContent;
};

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

/** A single portfolio item with multilingual summary. */
export type PortfolioItem = {
  id: string;
  slug: string;
  order: number;
  visible: boolean;
  liveUrl?: string;
  coverImage?: string;
  tags: string[];
  az: { title: string; summary: string };
  en: { title: string; summary: string };
  ru: { title: string; summary: string };
};

// ---------------------------------------------------------------------------
// Messages (i18n)
// ---------------------------------------------------------------------------

/** Arbitrary JSON tree representing an i18n message catalogue. */
export type MessageTree = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Server action result types
// ---------------------------------------------------------------------------

/**
 * Returned by portfolio and blog server actions instead of calling redirect().
 * The client form component reads this state and navigates via router.push().
 */
export type FormActionResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "server"; detail?: string };

// ---------------------------------------------------------------------------
// Contact topics (contact form subject selector)
// ---------------------------------------------------------------------------

/**
 * A single selectable topic in the contact form.
 *
 * `telegramLabel` is always in Azerbaijani so every Telegram notification is
 * consistent for the recipient regardless of the visitor's UI locale.
 */
export type ContactTopic = {
  /** URL-safe kebab-case slug, e.g. "new-website". Stable identifier. */
  id: string;
  /** Azerbaijani label sent in the Telegram notification. */
  telegramLabel: string;
  /** Display label shown in the form for each locale. */
  az: string;
  en: string;
  ru: string;
  /** Sort order, 0-based. */
  order: number;
};
