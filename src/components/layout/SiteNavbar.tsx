import { Navbar } from "./Navbar";
import { telHref } from "@/lib/contact";
import { hasVisiblePortfolio } from "@/lib/portfolio";
import { getCachedSettings } from "@/lib/siteSettings";

/**
 * Server-side data wrapper around the (client) `Navbar`.
 *
 * The navbar needs two pieces of server state — whether the home page renders
 * a `#portfolio` section, and the admin-configured phone number — but it must
 * stay a client component for its motion and reduced-motion handling. Every
 * route renders this instead of `Navbar` directly, so the fetching lives in
 * one place rather than being repeated in each page and layout.
 */
export async function SiteNavbar() {
  const [hasPortfolio, settings] = await Promise.all([
    hasVisiblePortfolio(),
    getCachedSettings(),
  ]);

  return (
    <Navbar
      hasPortfolio={hasPortfolio}
      phone={settings.contact.phone}
      telHref={telHref(settings.contact.phone)}
    />
  );
}
