/**
 * Contact-form field validation shared by the client form
 * (`src/components/sections/Contact.tsx`) and the route handler
 * (`src/app/api/contact/route.ts`).
 *
 * These used to be two copies of the same regex kept in sync by hand. The
 * server remains the source of truth — the client copy exists only so the user
 * gets an inline error instead of a round-trip.
 */

/**
 * Shape check: an optional leading `+`, then digits and the usual separators.
 * The digit *count* is checked separately — a shape-only regex like
 * `/^[+\d][\d\s\-()]{8,}$/` accepts "1--------", which is nine characters but
 * a single digit.
 */
const PHONE_SHAPE_RE = /^\+?[\d\s\-()]+$/;

/**
 * Azerbaijani numbers are 9 digits behind the +994 country code, but leads
 * from abroad are still worth capturing, so the bound is the international
 * one: ITU-T E.164 allows at most 15 digits.
 */
const PHONE_MIN_DIGITS = 9;
const PHONE_MAX_DIGITS = 15;

/**
 * Loose HTML `pattern` mirror of {@link isValidPhone}, for the `<input>`.
 *
 * Defence in depth only: the form sets `noValidate`, so browsers skip
 * constraint validation and JS does the real enforcement. It matters if
 * `noValidate` is ever dropped, and it documents the accepted shape.
 */
export const PHONE_INPUT_PATTERN = "\\+?[0-9\\s\\-()]{9,}";

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!PHONE_SHAPE_RE.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "").length;
  return digits >= PHONE_MIN_DIGITS && digits <= PHONE_MAX_DIGITS;
}

/** Deliberately permissive — strict enough to catch typos, loose enough for
 *  uncommon TLDs. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
