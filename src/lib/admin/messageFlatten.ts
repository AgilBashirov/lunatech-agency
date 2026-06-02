/**
 * Utilities for converting a nested i18n message tree to/from flat dot-notation.
 *
 * flattenMessages({ hero: { title: 'Biz' } })
 *   → { 'hero.title': 'Biz' }
 *
 * unflattenMessages({ 'hero.title': 'Biz' })
 *   → { hero: { title: 'Biz' } }
 *
 * Rules:
 * - Only string leaf values are flattened; number/boolean are coerced to string.
 * - Arrays are NOT recursed — stored as JSON.stringify'd strings to preserve
 *   structure (they are rare in message catalogues).
 * - Empty strings are preserved.
 */

// ---------------------------------------------------------------------------
// flattenMessages
// ---------------------------------------------------------------------------

/**
 * Recursively flatten a nested object to dot-notation key/string-value pairs.
 */
export function flattenMessages(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const dotKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      // Arrays are stored serialised — they should not be recursed.
      result[dotKey] = JSON.stringify(value);
    } else if (
      value !== null &&
      typeof value === "object"
    ) {
      // Recurse into plain objects.
      const nested = flattenMessages(
        value as Record<string, unknown>,
        dotKey,
      );
      Object.assign(result, nested);
    } else {
      // string | number | boolean | null | undefined → string leaf.
      result[dotKey] =
        value === null || value === undefined ? "" : String(value);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// unflattenMessages
// ---------------------------------------------------------------------------

/**
 * Reconstruct a nested object from flat dot-notation key/string pairs.
 *
 * Values that were serialised arrays (via JSON.stringify in flattenMessages)
 * are parsed back to arrays.
 */
export function unflattenMessages(
  flat: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [dotKey, rawValue] of Object.entries(flat)) {
    const parts = dotKey.split(".");

    // Attempt to restore arrays that were serialised by flattenMessages.
    let value: unknown = rawValue;
    if (rawValue.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(rawValue);
        if (Array.isArray(parsed)) value = parsed;
      } catch {
        // Not valid JSON — treat as a plain string.
      }
    }

    // Drill into (or create) the nested object structure.
    let cursor = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const segment = parts[i];
      if (
        !(segment in cursor) ||
        cursor[segment] === null ||
        typeof cursor[segment] !== "object" ||
        Array.isArray(cursor[segment])
      ) {
        cursor[segment] = {};
      }
      cursor = cursor[segment] as Record<string, unknown>;
    }

    cursor[parts[parts.length - 1]] = value;
  }

  return result;
}
