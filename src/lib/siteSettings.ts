import { cache } from "react";
import { getSettings } from "@/lib/admin/contentStore";

/**
 * Request-scoped `getSettings()`.
 *
 * The public chrome reads settings from three places on every page — the
 * navbar's phone link, the footer contact block and the WhatsApp button. The
 * Blob helpers opt out of the Next.js fetch cache (`useCache: false` in
 * `admin/blob.ts`), so without this each render would issue three separate
 * round-trips for the same document.
 *
 * Admin write paths keep using `getSettings()`/`setSettings()` directly, where
 * reading a memoised copy after a write would be wrong.
 */
export const getCachedSettings = cache(getSettings);
