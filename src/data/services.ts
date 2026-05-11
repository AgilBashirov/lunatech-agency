/**
 * Contact-form service catalogue.
 *
 * Centralised so the form, the API route, and (future) an admin panel can
 * share a single source of truth. To swap this for a remote source later,
 * keep `id` stable and load `SERVICE_OPTIONS` from an API. `telegramLabel`
 * is the canonical Azerbaijani label used in the Telegram notification —
 * it must stay in Az regardless of the visitor's UI locale so the
 * recipient always reads a consistent message.
 */

export const SERVICE_OPTIONS = [
  { id: "newWebsite", telegramLabel: "Yeni vebsayt" },
  { id: "uxUi", telegramLabel: "UX/UI dizayn" },
  { id: "sima", telegramLabel: "Sima inteqrasiya" },
  { id: "digitalLogin", telegramLabel: "Digital login inteqrasiya" },
  { id: "other", telegramLabel: "Digər" },
] as const;

export type ServiceId = (typeof SERVICE_OPTIONS)[number]["id"];

export function isServiceId(value: string): value is ServiceId {
  return SERVICE_OPTIONS.some((s) => s.id === value);
}

export function getServiceTelegramLabel(id: ServiceId): string {
  return SERVICE_OPTIONS.find((s) => s.id === id)!.telegramLabel;
}
