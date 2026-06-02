/**
 * Contact-form service catalogue.
 *
 * The static `SERVICE_OPTIONS` array is kept as a compile-time fallback so the
 * contact route handler can operate without a Blob token (e.g. local dev).
 *
 * Dynamic access should go through `loadContactTopics()` which reads from
 * Vercel Blob and falls back to the static array.
 *
 * Legacy helpers `isServiceId` / `getServiceTelegramLabel` are intentionally
 * preserved — they continue to work for any caller that has not yet migrated to
 * the topic-aware variants `isValidTopicId` / `getTopicTelegramLabel`.
 */

import type { ContactTopic } from "@/lib/admin/types";

// ---------------------------------------------------------------------------
// Static fallback (legacy)
// ---------------------------------------------------------------------------

export const SERVICE_OPTIONS = [
  { id: "newWebsite", telegramLabel: "Yeni vebsayt" },
  { id: "uxUi", telegramLabel: "UX/UI dizayn" },
  { id: "sima", telegramLabel: "Sima inteqrasiya" },
  { id: "digitalLogin", telegramLabel: "Digital login inteqrasiya" },
  { id: "other", telegramLabel: "Digər" },
] as const;

export type ServiceId = (typeof SERVICE_OPTIONS)[number]["id"];

/** @deprecated Use isValidTopicId with a live topics list instead. */
export function isServiceId(value: string): value is ServiceId {
  return SERVICE_OPTIONS.some((s) => s.id === value);
}

/** @deprecated Use getTopicTelegramLabel with a live topics list instead. */
export function getServiceTelegramLabel(id: ServiceId): string {
  return SERVICE_OPTIONS.find((s) => s.id === id)!.telegramLabel;
}

// ---------------------------------------------------------------------------
// Dynamic helpers (topic-aware)
// ---------------------------------------------------------------------------

/**
 * Check whether `id` matches any topic in the provided list.
 * Used by the API route handler after loading topics from Blob.
 */
export function isValidTopicId(id: string, topics: ContactTopic[]): boolean {
  return topics.some((t) => t.id === id);
}

/**
 * Return the Azerbaijani Telegram label for a topic by its id.
 * Falls back to the id itself if no match is found (should not happen in
 * practice because callers validate with `isValidTopicId` first).
 */
export function getTopicTelegramLabel(
  id: string,
  topics: ContactTopic[],
): string {
  return topics.find((t) => t.id === id)?.telegramLabel ?? id;
}

// ---------------------------------------------------------------------------
// Async loader (Blob → static fallback)
// ---------------------------------------------------------------------------

/**
 * Load contact topics from Vercel Blob.
 *
 * This function is safe to call from Server Components and Route Handlers.
 * It always resolves: on failure it falls back to a seed list derived from
 * the legacy SERVICE_OPTIONS so the contact form is never broken.
 */
export async function loadContactTopics(): Promise<ContactTopic[]> {
  try {
    const { getContactTopics } = await import("@/lib/admin/contentStore");
    return await getContactTopics();
  } catch {
    // Blob unavailable or import failed — return static seed.
    return SERVICE_OPTIONS.map((opt, index) => ({
      id: opt.id,
      telegramLabel: opt.telegramLabel,
      az: opt.telegramLabel,
      en: opt.telegramLabel,
      ru: opt.telegramLabel,
      order: index,
    }));
  }
}
