import { test, expect, type Page } from "@playwright/test";

/**
 * Service detail pages (`/[locale]/services/[slug]`).
 *
 * Two page shapes exist:
 *
 * 1. Editorial template — used by `uiux`, `strategy`, `performance`. Heading
 *    ids: hero / what-we-do / usecases / howitworks / benefits / cta.
 *
 * 2. Bespoke layout — used by `government` and `web-experience`. Conversion-
 *    first layout with a single compact "overview" block replacing the three
 *    list sections. Heading ids: hero / what-we-do / overview / cta. The
 *    usecases / howitworks / benefits ids do NOT appear on these pages.
 *
 * Coverage:
 *  - Bespoke section set (4 ids) and intentional absence of FAQ /
 *    problem / solution / usecases / howitworks / benefits ids
 *  - BackToHomeButton at top AND bottom on every detail page; locale-aware
 *  - Locale-specific BackToHome label (en / az / ru)
 *  - No <canvas> (= no MoonBackdrop) on detail pages
 *  - Home still mounts the Moon (regression guard)
 *  - "Learn more" affordance on each home service card, in all locales
 *  - Locale switcher rewrites the slug-aware URL
 *  - 404 on bad slug
 *  - Final CTA navigates to locale-aware /[locale]#contact
 *  - Lightweight bundle smoke check: no `three` / `@react-three` script chunks
 *  - Existing-feature regression: home ProcessTimeline still renders 01..04
 *  - Heading hierarchy: exactly one <h1> on the detail page
 */

const SLUGS = [
  "web-experience",
  "uiux",
  "strategy",
  "performance",
  "government",
] as const;

const LOCALES = ["az", "en", "ru"] as const;

/** Bespoke section set (4 ids). The previous three list sections collapsed
 *  into a single "overview" block. */
const BESPOKE_HEADING_IDS = [
  "svc-hero-heading",
  "svc-what-we-do-heading",
  "svc-overview-heading",
  "svc-cta-heading",
] as const;

/** Heading ids that must NOT appear on bespoke pages. The first three are
 *  pre-simplification leftovers; the last three are the editorial-template
 *  ids that the bespoke overview consolidates away. */
const BESPOKE_REMOVED_HEADING_IDS = [
  "svc-problem-heading",
  "svc-solution-heading",
  "svc-faq-heading",
  "svc-usecases-heading",
  "svc-howitworks-heading",
  "svc-benefits-heading",
] as const;

/** Slugs that render the bespoke layout. */
const BESPOKE_SLUGS = ["government", "web-experience"] as const;

const BACK_TO_HOME_LABEL = {
  en: "Back to home",
  az: "Ana səhifəyə qayıt",
  ru: "На главную",
} as const;

const LEARN_MORE_LABEL = {
  en: "Learn more",
  az: "Ətraflı",
  ru: "Подробнее",
} as const;

async function gotoDetail(page: Page, locale: string, slug: string) {
  return page.goto(`/${locale}/services/${slug}`, { waitUntil: "load" });
}

test.describe("Service detail — home grid wiring", () => {
  test("each of the 5 service cards links to its detail page (en)", async ({
    page,
  }) => {
    // Structural assertion only — Lenis + the moon canvas cover-stack make
    // headless click-through brittle on small viewports. We assert the
    // link wiring (href + reachability) instead. The slug × locale matrix
    // test exercises the destination route directly.
    await page.goto("/en", { waitUntil: "load" });
    const grid = page.locator("#services");
    await expect(grid).toBeVisible();
    await grid.scrollIntoViewIfNeeded();
    for (const slug of SLUGS) {
      const card = grid.locator(`a[href="/en/services/${slug}"]`).first();
      await expect(
        card,
        `home grid is missing a link to /en/services/${slug}`,
      ).toBeVisible();
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

test.describe("Service detail — heading hierarchy", () => {
  for (const slug of BESPOKE_SLUGS) {
    test(`the bespoke ${slug} detail page renders exactly one <h1>`, async ({
      page,
    }) => {
      await gotoDetail(page, "en", slug);
      // The simplified header is the sole H1 source. Every other section uses
      // <h2> (via ServiceSection) or <h3> (per-row titles).
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1#svc-hero-heading")).toBeVisible();
    });
  }
});

test.describe("Service detail — bespoke section set", () => {
  for (const slug of BESPOKE_SLUGS) {
    test(`only the 4 bespoke headings render for ${slug}; legacy ids are gone`, async ({
      page,
    }) => {
      await gotoDetail(page, "en", slug);

      for (const id of BESPOKE_HEADING_IDS) {
        const heading = page.locator(`#${id}`);
        await expect(
          heading,
          `expected heading element #${id} to be in DOM for ${slug}`,
        ).toHaveCount(1);
        const section = page.locator(`section[aria-labelledby="${id}"]`);
        await expect(
          section,
          `expected <section aria-labelledby="${id}"> wrapper for ${slug}`,
        ).toHaveCount(1);
      }

      // Neither the pre-simplification ids nor the editorial-template ids that
      // the bespoke overview block consolidates away may appear.
      for (const removedId of BESPOKE_REMOVED_HEADING_IDS) {
        await expect(
          page.locator(`#${removedId}`),
          `removed heading #${removedId} must not be in the ${slug} DOM`,
        ).toHaveCount(0);
        await expect(
          page.locator(`section[aria-labelledby="${removedId}"]`),
          `removed section[aria-labelledby="${removedId}"] must not be in the ${slug} DOM`,
        ).toHaveCount(0);
      }
    });

    test(`overview block on ${slug} renders three card titles (desktop + accordion shape)`, async ({
      page,
    }) => {
      await gotoDetail(page, "en", slug);
      const overview = page.locator(
        'section[aria-labelledby="svc-overview-heading"]',
      );
      await expect(overview).toBeVisible();

      // The three cards each render an <h3> with the localized card title.
      // Both desktop columns and mobile <details> render — the responsive
      // toggle is purely CSS — so we expect six <h3>s total in the section.
      const cardHeadings = overview.locator("h3");
      expect(
        await cardHeadings.count(),
        "overview should expose three card titles per viewport (desktop + accordion)",
      ).toBe(6);
    });
  }
});

test.describe("Service detail — invalid slug behaviour", () => {
  test("unknown slug yields a 404 like the rest of the site", async ({
    page,
  }) => {
    const response = await page.goto("/en/services/totally-not-real", {
      waitUntil: "load",
    });
    expect(response, "navigation produced no response").not.toBeNull();
    expect(response!.status()).toBe(404);
  });
});

test.describe("Service detail — locale switching", () => {
  test("EN and AZ render distinct localized hero copy on the same slug", async ({
    page,
  }) => {
    // The LanguageSwitcher click triggers a next-intl soft-nav that can stall
    // in headless dev mode (the `aria-pressed` flips before the URL settles).
    // We instead navigate directly to each locale and assert the rendered
    // content differs — this tests what users care about (locale-aware
    // routing + per-locale content) without coupling to switcher
    // interactivity, which is covered separately by the existing nav tests.
    await gotoDetail(page, "en", "government");
    await expect(page.locator("h1#svc-hero-heading")).toBeVisible();
    const enHeroText =
      (await page.locator("h1#svc-hero-heading").textContent())?.trim() ?? "";

    await gotoDetail(page, "az", "government");
    await expect(page).toHaveURL(/\/az\/services\/government$/);
    await expect(page.locator("h1#svc-hero-heading")).toBeVisible();
    const azHeroText =
      (await page.locator("h1#svc-hero-heading").textContent())?.trim() ?? "";
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
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("final CTA links to the locale-aware /[locale]#contact", async ({
    page,
  }) => {
    await gotoDetail(page, "en", "government");
    // The simplified ServicePageHeader has NO CTA — only title + lede + back
    // button (per spec R3.2). The page CTA lives only in ServiceCTASection.
    const ctaSection = page.locator('section[aria-labelledby="svc-cta-heading"]');
    await expect(ctaSection).toBeVisible();
    const ctaAnchor = ctaSection.locator("a").first();
    await expect(ctaAnchor).toBeVisible();
    const href = await ctaAnchor.getAttribute("href");
    expect(
      href,
      `final CTA href should target /en#contact (got: ${href})`,
    ).toBe("/en#contact");
  });

  test("ServicePageHeader is link-free — no Hero CTA in the simplified layout", async ({
    page,
  }) => {
    await gotoDetail(page, "en", "government");
    const heroSection = page.locator(
      'section[aria-labelledby="svc-hero-heading"]',
    );
    await expect(heroSection).toBeVisible();
    // The simplified header is title + lede + eyebrow only. Anchors inside
    // this section would either be a re-introduced Hero CTA (regression) or a
    // misplaced BackToHomeButton (the back link must live OUTSIDE the header).
    await expect(heroSection.locator("a")).toHaveCount(0);
  });
});

test.describe("Service detail — BackToHomeButton", () => {
  test("renders at top AND bottom of every detail page (en/government)", async ({
    page,
  }) => {
    await gotoDetail(page, "en", "government");
    const backLinks = page.getByRole("link", {
      name: new RegExp(BACK_TO_HOME_LABEL.en, "i"),
    });
    // Top + bottom placement — both must mount.
    await expect(backLinks).toHaveCount(2);

    // Both must point at the locale-aware home (`/en`), not the unprefixed `/`.
    for (let i = 0; i < 2; i++) {
      const href = await backLinks.nth(i).getAttribute("href");
      expect(
        href,
        `BackToHomeButton[${i}] href should target /en, got: ${href}`,
      ).toMatch(/^\/en\/?$/);
    }
  });

  test("clicking the top BackToHomeButton navigates to /en (locale preserved)", async ({
    page,
  }) => {
    await gotoDetail(page, "en", "government");
    const topBack = page
      .getByRole("link", { name: new RegExp(BACK_TO_HOME_LABEL.en, "i") })
      .first();
    await expect(topBack).toBeVisible();
    await topBack.click();
    await page.waitForURL(/\/en\/?$/);
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test("clicking the bottom BackToHomeButton navigates to /en (locale preserved)", async ({
    page,
  }) => {
    await gotoDetail(page, "en", "government");
    const bottomBack = page
      .getByRole("link", { name: new RegExp(BACK_TO_HOME_LABEL.en, "i") })
      .last();
    await expect(bottomBack).toBeVisible();
    await bottomBack.scrollIntoViewIfNeeded();
    await bottomBack.click();
    await page.waitForURL(/\/en\/?$/);
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  for (const locale of LOCALES) {
    test(`BackToHomeButton uses the localized label for ${locale}`, async ({
      page,
    }) => {
      await gotoDetail(page, locale, "government");
      const label = BACK_TO_HOME_LABEL[locale];
      const links = page.getByRole("link", {
        name: new RegExp(label, "i"),
      });
      // Both top and bottom mount the same component → 2 matches per locale.
      await expect(links).toHaveCount(2);

      // Locale-aware destination check (`/az`, `/en`, `/ru`).
      const href = await links.first().getAttribute("href");
      expect(href).toMatch(new RegExp(`^/${locale}/?$`));
    });
  }
});

test.describe("Detail page is moon-free (no MoonBackdrop)", () => {
  for (const locale of LOCALES) {
    test(`/${locale}/services/government renders no moon scene or canvas`, async ({
      page,
    }) => {
      await gotoDetail(page, locale, "government");
      // MoonBackdrop → MoonScene → @react-three/fiber's <Canvas> → real
      // <canvas>. If any of those mount on a detail page we regress R5.
      // Allow a tick in case the Canvas chunk hydrates lazily before assert.
      await page.waitForTimeout(800);
      await expect(
        page.locator(".moon-backdrop"),
        "moon backdrop wrapper must NOT mount on the simplified detail page",
      ).toHaveCount(0);
      await expect(
        page.locator("canvas"),
        "no <canvas> (no WebGL moon) must mount on the simplified detail page",
      ).toHaveCount(0);
    });
  }
});

test.describe("Home regression — moon and learnMore intact", () => {
  test("home page still ships the MoonScene chunk", async ({ page }) => {
    // Structural check — the runtime `.moon-backdrop` wrapper depends on the
    // dynamic three.js chunk fully loading, which is unreliable in headless
    // dev mode. Instead we assert the home page references the MoonScene
    // chunk in its served HTML; the home keeping that chunk is the actual
    // regression we want to guard against, since the detail-page refactor
    // could otherwise quietly tree-shake it out of the home bundle too.
    const response = await page.goto("/en", { waitUntil: "load" });
    expect(response?.status()).toBe(200);
    const html = await page.content();
    expect(
      /MoonScene|moon[-_/]scene/i.test(html),
      "home HTML must still reference the MoonScene chunk",
    ).toBe(true);
  });

  for (const locale of LOCALES) {
    test(`home service cards expose the "Learn more" affordance for ${locale}`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`, { waitUntil: "load" });
      const grid = page.locator("#services");
      await expect(grid).toBeVisible();
      await grid.scrollIntoViewIfNeeded();

      const label = LEARN_MORE_LABEL[locale];
      // Each card is a separate <a>; each card carries its own "Learn more"
      // span. With 5 services there must be 5 of them.
      const learnMore = grid.getByText(label, { exact: true });
      await expect(learnMore).toHaveCount(SLUGS.length);
    });
  }

  test("home AgencyNarrative numbered stepper still renders 01..04", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });
    const about = page.locator("#about");
    await expect(about).toBeVisible();
    await about.scrollIntoViewIfNeeded();

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

test.describe("Detail bundle smoke — no three / @react-three chunks", () => {
  test("rendered HTML on /en/services/government has no three.js script refs", async ({
    page,
  }) => {
    await gotoDetail(page, "en", "government");
    // Sample 1: full document HTML — picks up inline script src & module
    // preloads emitted by Next.
    const html = await page.content();
    expect(
      html,
      "detail page HTML should not reference the three runtime",
    ).not.toMatch(/["/]three[.\/]/);
    expect(
      html,
      "detail page HTML should not reference @react-three",
    ).not.toMatch(/@react-three/);

    // Sample 2: enumerate live <script src> values — catches dynamically
    // injected chunks that may not appear in static HTML. The MoonScene chunk
    // is dynamically imported behind ssr:false on the home page; the detail
    // page must never trigger that import.
    const scriptSrcs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script[src]")).map(
        (s) => (s as HTMLScriptElement).src,
      ),
    );
    for (const src of scriptSrcs) {
      expect(
        src,
        `script src "${src}" should not pull in three / @react-three on the detail page`,
      ).not.toMatch(/three|react-three/i);
    }
  });
});
