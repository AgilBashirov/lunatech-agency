import { test, expect, type Page } from "@playwright/test";

/**
 * Service detail pages (`/[locale]/services/[slug]`).
 *
 * Coverage:
 *  - Home grid links to detail pages
 *  - All 15 (5 slugs × 3 locales) combinations 200 + render hero H1
 *  - All 8 sections render on a slug with real copy (`government`)
 *  - 404 on invalid slug
 *  - Locale switcher rewrites the slug-aware URL
 *  - Header / footer landmarks present on detail pages
 *  - Hero CTA navigates back to /#contact
 *  - Token-level structural checks (background colour, hero font, t-eyebrow reuse)
 *  - Existing-feature regression: home AgencyNarrative stepper still shows 01..04
 */

const SLUGS = [
  "web-experience",
  "uiux",
  "strategy",
  "performance",
  "government",
] as const;

const LOCALES = ["az", "en", "ru"] as const;

const SECTION_HEADING_IDS = [
  "svc-hero-heading",
  "svc-problem-heading",
  "svc-solution-heading",
  "svc-usecases-heading",
  "svc-howitworks-heading",
  "svc-benefits-heading",
  "svc-faq-heading",
  "svc-cta-heading",
] as const;

async function gotoDetail(page: Page, locale: string, slug: string) {
  return page.goto(`/${locale}/services/${slug}`, { waitUntil: "load" });
}

test.describe("Service detail — home grid wiring", () => {
  test("each of the 5 service cards links to its detail page (en)", async ({
    page,
  }) => {
    for (const slug of SLUGS) {
      await page.goto("/en", { waitUntil: "load" });
      const grid = page.locator("#services");
      await expect(grid).toBeVisible();
      await grid.scrollIntoViewIfNeeded();

      const card = grid.locator(`a[href="/en/services/${slug}"]`).first();
      await expect(
        card,
        `home grid is missing a link to /en/services/${slug}`,
      ).toBeVisible();
      await card.click();

      await page.waitForURL(`**/en/services/${slug}`);
      await expect(page).toHaveURL(new RegExp(`/en/services/${slug}$`));
      // Hero H1 must render on landing.
      await expect(page.locator("h1#svc-hero-heading")).toBeVisible();
    }
  });
});

test.describe("Service detail — slug × locale matrix", () => {
  for (const slug of SLUGS) {
    for (const locale of LOCALES) {
      test(`returns 200 and renders a single Hero h1 for ${locale}/${slug}`, async ({
        page,
      }) => {
        const response = await gotoDetail(page, locale, slug);
        expect(
          response?.status(),
          `expected 200 for /${locale}/services/${slug}`,
        ).toBe(200);

        // Exactly one <h1>; non-empty text.
        const h1s = page.locator("h1");
        await expect(h1s).toHaveCount(1);
        const heroHeading = page.locator("h1#svc-hero-heading");
        await expect(heroHeading).toBeVisible();
        const text = (await heroHeading.textContent())?.trim() ?? "";
        expect(text.length, "hero H1 text must be non-empty").toBeGreaterThan(
          0,
        );
      });
    }
  }
});

test.describe("Service detail — all 8 sections render (government)", () => {
  test("all 8 aria-labelledby section headings exist on /en/services/government", async ({
    page,
  }) => {
    await gotoDetail(page, "en", "government");

    for (const id of SECTION_HEADING_IDS) {
      const heading = page.locator(`#${id}`);
      await expect(
        heading,
        `expected heading element #${id} to be in DOM`,
      ).toHaveCount(1);
      // The corresponding <section aria-labelledby="…"> wrapper must exist too.
      const section = page.locator(`section[aria-labelledby="${id}"]`);
      await expect(
        section,
        `expected <section aria-labelledby="${id}"> wrapper`,
      ).toHaveCount(1);
    }
  });
});

test.describe("Service detail — invalid slug behaviour", () => {
  test("unknown slug yields a 404 like the rest of the site", async ({
    page,
  }) => {
    const response = await page.goto("/en/services/totally-not-real", {
      waitUntil: "load",
    });
    expect(response, "navigation produced no response").not.toBeNull();
    // Next renders its built-in not-found UI for `notFound()` calls — the
    // HTTP status must be 404 to match the rest of the site's missing pages.
    expect(response!.status()).toBe(404);
  });
});

test.describe("Service detail — locale switching", () => {
  test("switching from EN to AZ rewrites the URL on a service detail page", async ({
    page,
  }) => {
    await gotoDetail(page, "en", "government");
    await expect(page.locator("h1#svc-hero-heading")).toBeVisible();
    const enHeroText =
      (await page.locator("h1#svc-hero-heading").textContent())?.trim() ?? "";

    const lang = page.getByRole("group", { name: "Language" }).first();
    await expect(lang).toBeVisible();
    await lang.getByRole("button", { name: "AZ" }).click();

    await page.waitForURL("**/az/services/government");
    await expect(page).toHaveURL(/\/az\/services\/government$/);

    const azHeroText =
      (await page.locator("h1#svc-hero-heading").textContent())?.trim() ?? "";
    // Different locale must produce different copy (government has real, locale-distinct copy).
    expect(
      azHeroText,
      "AZ hero copy should differ from EN hero copy",
    ).not.toBe(enHeroText);
    expect(azHeroText.length).toBeGreaterThan(0);
  });
});

test.describe("Service detail — chrome", () => {
  test("nav and footer landmarks are present", async ({ page }) => {
    await gotoDetail(page, "en", "government");
    // Navbar mounts a <nav> element; Footer mounts a <footer> landmark.
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("Hero CTA links to the locale-aware /[locale]#contact", async ({ page }) => {
    await gotoDetail(page, "en", "government");
    const heroSection = page.locator('section[aria-labelledby="svc-hero-heading"]');
    await expect(heroSection).toBeVisible();
    // The Hero primary CTA is a locale-aware next-intl `<Link>` (renders an
    // `<a>`) wrapping a `<button>`. The pathname must carry the active locale
    // prefix so users land on the home page in their current language, not
    // the default-locale home (`/#contact` would strip the locale — B1).
    const ctaAnchor = heroSection.locator("a").first();
    await expect(ctaAnchor).toBeVisible();
    const href = await ctaAnchor.getAttribute("href");
    expect(
      href,
      `hero CTA href should target /en#contact (got: ${href})`,
    ).toBe("/en#contact");
  });
});

test.describe("Service detail — token-level visual consistency", () => {
  test("body background matches the home page (resolves to --background token)", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });
    const homeBg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(homeBg, "home body should have a computed background").toBeTruthy();

    await gotoDetail(page, "en", "government");
    const detailBg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(detailBg).toBe(homeBg);
  });

  test("Hero H1 font-family matches the home Hero H1", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const homeH1 = page.locator("h1").first();
    await expect(homeH1).toBeVisible();
    await expect(homeH1).toHaveCSS("font-family", /Space Grotesk/);
    const homeFont = await homeH1.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );

    await gotoDetail(page, "en", "government");
    await page.evaluate(() => document.fonts.ready);
    const detailH1 = page.locator("h1#svc-hero-heading");
    await expect(detailH1).toBeVisible();
    await expect(detailH1).toHaveCSS("font-family", homeFont);
  });

  test(".t-eyebrow utility is reused on the detail page (same as home)", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });
    // Home uses t-eyebrow on Services / Contact section eyebrows.
    expect(await page.locator(".t-eyebrow").count()).toBeGreaterThan(0);

    await gotoDetail(page, "en", "government");
    expect(
      await page.locator(".t-eyebrow").count(),
      "detail page should reuse the .t-eyebrow utility (Hero eyebrow)",
    ).toBeGreaterThan(0);
  });
});

test.describe("Existing-feature regression", () => {
  test("home AgencyNarrative numbered stepper still renders 01..04", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });
    const about = page.locator("#about");
    await expect(about).toBeVisible();
    await about.scrollIntoViewIfNeeded();

    // The ProcessTimeline outputs zero-padded indices ("01".."05"). Even on
    // mobile-stacked + desktop-tablist layouts, at least one timeline of 4
    // steps must be present in the DOM after extraction.
    for (const idx of ["01", "02", "03", "04"]) {
      const matches = page.getByText(idx, { exact: true });
      const count = await matches.count();
      expect(
        count,
        `expected at least one numbered step "${idx}" on the home page`,
      ).toBeGreaterThanOrEqual(1);
    }
  });
});
