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

/** Social media links managed from the admin panel. Empty string = hidden. */
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
};

export const DEFAULT_SETTINGS: SiteSettings = {
  social: {
    x: "",
    linkedin: "",
    dribbble: "",
    instagram: "",
    facebook: "",
    youtube: "",
    github: "",
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
