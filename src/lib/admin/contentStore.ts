/**
 * High-level content store API.
 *
 * Wraps blob.ts to expose typed read/write operations for each content domain.
 * All functions are async and provide graceful degradation when Vercel Blob is
 * unavailable (no token in env):
 *
 * - getBlogPosts()  → [] (empty array, never throws)
 * - getPortfolio()  → [] (empty array, never throws)
 * - getMessages()   → falls back to the static messages/{locale}.json file,
 *                     then writes that content to Blob for subsequent calls
 *                     (auto-seed on first run).
 *
 * Blob path convention:
 *   content/blog.json
 *   content/portfolio.json
 *   content/messages/{locale}.json
 */

import type { BlogPost, ContactTopic, MessageTree, PortfolioItem, SiteSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { readJson, writeJson } from "./blob";

// ---------------------------------------------------------------------------
// Path constants
// ---------------------------------------------------------------------------

const PATHS = {
  blog: "content/blog.json",
  portfolio: "content/portfolio.json",
  contactTopics: "content/contact-topics.json",
  settings: "content/settings.json",
  messages: (locale: "az" | "en" | "ru") =>
    `content/messages/${locale}.json` as const,
} as const;

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

/**
 * Read all blog posts from Blob storage.
 * Returns an empty array when the file is absent or Blob is unavailable.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const result = await readJson<BlogPost[]>(PATHS.blog);
  return result ?? [];
}

/**
 * Persist the full blog post list to Blob storage.
 * No-op when Blob token is absent.
 */
export async function setBlogPosts(posts: BlogPost[]): Promise<void> {
  await writeJson<BlogPost[]>(PATHS.blog, posts);
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<SiteSettings> {
  const result = await readJson<SiteSettings>(PATHS.settings);
  if (!result) return DEFAULT_SETTINGS;
  // Merge with defaults so new keys added later are always present.
  return { ...DEFAULT_SETTINGS, ...result, social: { ...DEFAULT_SETTINGS.social, ...result.social } };
}

export async function setSettings(data: SiteSettings): Promise<void> {
  await writeJson<SiteSettings>(PATHS.settings, data);
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

const PORTFOLIO_SEED: PortfolioItem[] = [
  {
    id: "seed-1", slug: "web-platform", order: 0, visible: true,
    tags: ["Web"],
    az: { title: "Veb platforma", summary: "Müasir veb həll" },
    en: { title: "Web platform", summary: "Modern web solution" },
    ru: { title: "Веб-платформа", summary: "Современное веб-решение" },
  },
  {
    id: "seed-2", slug: "mobile-app", order: 1, visible: true,
    tags: ["Mobile"],
    az: { title: "Mobil tətbiq", summary: "iOS və Android üçün" },
    en: { title: "Mobile app", summary: "iOS and Android" },
    ru: { title: "Мобильное приложение", summary: "iOS и Android" },
  },
  {
    id: "seed-3", slug: "gov-portal", order: 2, visible: true,
    tags: ["Government"],
    az: { title: "Dövlət portalı", summary: "E-xidmət inteqrasiyası" },
    en: { title: "Gov portal", summary: "E-service integration" },
    ru: { title: "Гос. портал", summary: "Интеграция е-услуг" },
  },
  {
    id: "seed-4", slug: "ux-redesign", order: 3, visible: true,
    tags: ["UX/UI"],
    az: { title: "UX yenilənməsi", summary: "İstifadəçi təcrübəsi" },
    en: { title: "UX redesign", summary: "User experience overhaul" },
    ru: { title: "Редизайн UX", summary: "Улучшение пользовательского опыта" },
  },
  {
    id: "seed-5", slug: "crm-system", order: 4, visible: true,
    tags: ["Web"],
    az: { title: "CRM sistemi", summary: "Müştəri idarəetməsi" },
    en: { title: "CRM system", summary: "Customer management" },
    ru: { title: "CRM система", summary: "Управление клиентами" },
  },
  {
    id: "seed-6", slug: "analytics-dashboard", order: 5, visible: true,
    tags: ["Web"],
    az: { title: "Analitika paneli", summary: "Real vaxt məlumatlar" },
    en: { title: "Analytics dashboard", summary: "Real-time data insights" },
    ru: { title: "Аналитика", summary: "Данные в реальном времени" },
  },
];

/**
 * Read all portfolio items from Blob storage.
 * Falls back to PORTFOLIO_SEED when the file is absent or Blob is unavailable.
 */
export async function getPortfolio(): Promise<PortfolioItem[]> {
  const result = await readJson<PortfolioItem[]>(PATHS.portfolio);
  if (!result) return PORTFOLIO_SEED;
  // Back-fill `visible` for items saved before the field existed.
  return result.map((item) => ({
    ...item,
    visible: item.visible ?? true,
  }));
}

/**
 * Persist the full portfolio item list to Blob storage.
 * No-op when Blob token is absent.
 */
export async function setPortfolio(items: PortfolioItem[]): Promise<void> {
  await writeJson<PortfolioItem[]>(PATHS.portfolio, items);
}

// ---------------------------------------------------------------------------
// Contact topics
// ---------------------------------------------------------------------------

/**
 * Seed data matching the legacy SERVICE_OPTIONS in src/data/services.ts.
 * Used as fallback when no Blob file exists yet.
 */
const CONTACT_TOPICS_SEED: ContactTopic[] = [
  {
    id: "new-website",
    telegramLabel: "Yeni vebsayt",
    az: "Yeni vebsayt",
    en: "New website",
    ru: "Новый сайт",
    order: 0,
  },
  {
    id: "ux-ui",
    telegramLabel: "UX/UI dizayn",
    az: "UX/UI dizayn",
    en: "UX/UI design",
    ru: "UX/UI дизайн",
    order: 1,
  },
  {
    id: "sima",
    telegramLabel: "Sima inteqrasiya",
    az: "Sima inteqrasiya",
    en: "Sima integration",
    ru: "Sima интеграция",
    order: 2,
  },
  {
    id: "digital-login",
    telegramLabel: "Digital login inteqrasiya",
    az: "Digital login inteqrasiya",
    en: "Digital login integration",
    ru: "Digital login интеграция",
    order: 3,
  },
  {
    id: "other",
    telegramLabel: "Digər",
    az: "Digər",
    en: "Other",
    ru: "Другое",
    order: 4,
  },
];

/**
 * Read all contact topics from Blob storage.
 *
 * Falls back to the built-in seed list when the Blob file is absent or the
 * token is not configured. The seed mirrors the legacy SERVICE_OPTIONS so the
 * form behaves identically before the admin has made any changes.
 */
export async function getContactTopics(): Promise<ContactTopic[]> {
  const result = await readJson<ContactTopic[]>(PATHS.contactTopics);
  if (result !== null) {
    return [...result].sort((a, b) => a.order - b.order);
  }
  return CONTACT_TOPICS_SEED;
}

/**
 * Persist the full contact-topic list to Blob storage.
 * No-op when Blob token is absent.
 */
export async function setContactTopics(topics: ContactTopic[]): Promise<void> {
  await writeJson<ContactTopic[]>(PATHS.contactTopics, topics);
}

// ---------------------------------------------------------------------------
// Messages (i18n)
// ---------------------------------------------------------------------------

/**
 * Read an i18n message catalogue from Blob storage.
 *
 * Seed behaviour: if the file does not exist in Blob (first run), the function
 * loads the static `messages/{locale}.json` bundle via dynamic import, writes
 * it to Blob, and returns it. This auto-seeds Blob on first access so
 * subsequent calls read from Blob.
 *
 * When Blob is unavailable (no token) the function falls back to the static
 * file directly and skips the write step.
 */
export async function getMessages(
  locale: "az" | "en" | "ru",
): Promise<MessageTree> {
  const blobPath = PATHS.messages(locale);

  // Try Blob first.
  const fromBlob = await readJson<MessageTree>(blobPath);
  if (fromBlob !== null) return fromBlob;

  // Blob absent or unavailable — load from bundled static file.
  // Dynamic import resolves relative to the project root at build time.
  const staticModule = (await import(
    `../../../messages/${locale}.json`
  )) as { default: MessageTree };
  const staticData = staticModule.default;

  // Attempt to seed Blob for future calls (best-effort, skip on failure).
  try {
    await writeJson<MessageTree>(blobPath, staticData);
  } catch {
    // Intentionally swallowed — seeding is non-critical.
  }

  return staticData;
}

/**
 * Persist an i18n message catalogue to Blob storage.
 * No-op when Blob token is absent.
 */
export async function setMessages(
  locale: "az" | "en" | "ru",
  data: MessageTree,
): Promise<void> {
  await writeJson<MessageTree>(PATHS.messages(locale), data);
}
