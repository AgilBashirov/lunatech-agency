/**
 * Link builders for the admin-configured contact channels.
 *
 * Settings hold values in *display* form ("+994 50 123 45 67") because that is
 * what a human types into `/admin/settings`. Protocol links need them stripped,
 * so the normalisation rules live here rather than being repeated in the
 * Navbar, Footer and WhatsApp button.
 */

/** Keep a leading `+`, drop every separator. */
function digits(value: string): string {
  const trimmed = value.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}

/** `tel:` href, or `null` when unset. */
export function telHref(phone: string): string | null {
  const normalised = digits(phone);
  return normalised.replace(/\D/g, "") ? `tel:${normalised}` : null;
}

/** `mailto:` href, or `null` when unset. */
export function mailtoHref(email: string): string | null {
  const trimmed = email.trim();
  return trimmed ? `mailto:${trimmed}` : null;
}

/**
 * `https://wa.me/<number>` href, or `null` when unset.
 * wa.me rejects the `+` prefix and any separators — digits only.
 */
export function whatsappHref(whatsapp: string): string | null {
  const onlyDigits = whatsapp.replace(/\D/g, "");
  return onlyDigits ? `https://wa.me/${onlyDigits}` : null;
}
