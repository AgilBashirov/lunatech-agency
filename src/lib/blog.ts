/**
 * Blog helper functions.
 *
 * Wraps contentStore to expose typed, blog-specific read helpers.
 * All functions are async and return typed values — never `any`.
 */

import { getBlogPosts } from "@/lib/admin/contentStore";
import type { BlogPost } from "@/lib/admin/types";

// ---------------------------------------------------------------------------
// Public read helpers
// ---------------------------------------------------------------------------

/**
 * Return all published posts sorted by `publishedAt` descending (newest first).
 * Posts without `publishedAt` are treated as the oldest.
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts
    .filter((p) => p.status === "published")
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });
}

/**
 * Find a single published post by slug.
 * Returns `null` when not found or not published.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  const post = posts.find((p) => p.slug === slug && p.status === "published");
  return post ?? null;
}

/**
 * Return slugs of all published posts.
 * Used by `generateStaticParams` and the sitemap.
 */
export async function getPublishedSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return posts.map((p) => p.slug);
}

// ---------------------------------------------------------------------------
// Slug generator
// ---------------------------------------------------------------------------

/**
 * Convert arbitrary text to a URL-safe kebab-case slug.
 *
 * Steps:
 * 1. Lowercase
 * 2. Cyrillic → Latin transliteration (common chars)
 * 3. Azerbaijani / diacritic characters → ASCII equivalents
 * 4. Replace any non-alphanumeric characters with a hyphen
 * 5. Collapse repeated hyphens
 * 6. Strip leading / trailing hyphens
 */
export function generateSlug(text: string): string {
  const cyrillicMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
    ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  const azMap: Record<string, string> = {
    ə: "e", ı: "i", ö: "o", ü: "u", ğ: "g", ş: "s", ç: "c",
    Ə: "e", I: "i", Ö: "o", Ü: "u", Ğ: "g", Ş: "s", Ç: "c",
  };

  let slug = text.toLowerCase();

  // Cyrillic
  slug = slug.replace(
    /[а-яёъыьэюяА-ЯЁ]/g,
    (ch) => cyrillicMap[ch] ?? "",
  );

  // Azerbaijani / diacritics
  slug = slug.replace(
    /[əığşçöüƏIĞŞÇÖÜ]/g,
    (ch) => azMap[ch] ?? ch,
  );

  // Decompose remaining diacritics (NFD) then strip combining marks
  slug = slug
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  // Non-alphanumeric → hyphen, collapse, trim
  slug = slug
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug;
}

