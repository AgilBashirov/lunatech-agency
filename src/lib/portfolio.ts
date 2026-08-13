import { cache } from "react";
import { getPortfolio } from "@/lib/admin/contentStore";
import type { PortfolioItem } from "@/lib/admin/types";

/**
 * Visible portfolio items in display order.
 *
 * Wrapped in React's `cache()` so the homepage, the Navbar and the Footer can
 * each ask independently without triggering three Blob round-trips — the Blob
 * helpers deliberately opt out of the Next.js fetch cache (`useCache: false`
 * in `admin/blob.ts`), so per-request memoisation has to happen here.
 */
export const getVisiblePortfolio = cache(async (): Promise<PortfolioItem[]> => {
  const items = await getPortfolio();
  return items.filter((item) => item.visible).sort((a, b) => a.order - b.order);
});

/**
 * Whether the homepage renders its `#portfolio` section at all.
 *
 * Navigation that targets `#portfolio` must be gated on this — the section is
 * data-driven (see `src/app/[locale]/page.tsx`), so linking to it
 * unconditionally produces a dead anchor whenever the admin portfolio is empty.
 */
export async function hasVisiblePortfolio(): Promise<boolean> {
  return (await getVisiblePortfolio()).length > 0;
}
