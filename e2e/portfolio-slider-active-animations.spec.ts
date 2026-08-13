import { test, expect, type Page } from "@playwright/test";
import { skipWithoutPortfolio } from "./helpers/portfolio";

/**
 * Verifies the `data-active` animation gating fix: only the card matching
 * the current canonical index runs cover-art animations, and the rule
 * survives a forward wrap (kart 6 → kart 1) — which previously left the
 * user staring at a paused clone copy.
 */

const VIEWPORT = '#portfolio [data-testid="selected-work-viewport"]';

type ActiveAudit = {
  activeIndex: number;
  totalCards: number;
  activeCards: number;
  /** All `[data-active="true"]` cards must report `running` for at least one .pc-orb. */
  activePlayStates: string[];
  /** A spot-check on a single non-active card; must be `paused`. */
  inactiveSamplePlayState: string | null;
};

async function audit(page: Page): Promise<ActiveAudit> {
  return page.evaluate((sel) => {
    const vp = document.querySelector(sel) as HTMLElement | null;
    if (!vp) throw new Error("viewport not found");
    const activeIndex = Number(vp.getAttribute("data-selected-snap") ?? "0");
    const cards = [...vp.querySelectorAll<HTMLElement>(".cs-card")];
    const active = cards.filter((c) => c.dataset.active === "true");
    const activePlayStates = active.map((c) => {
      const orb = c.querySelector(".pc-orb--a") as HTMLElement | null;
      return orb ? getComputedStyle(orb).animationPlayState : "no-orb";
    });
    const inactive = cards.find((c) => c.dataset.active !== "true");
    const inactiveOrb = inactive
      ? (inactive.querySelector(".pc-orb--a") as HTMLElement | null)
      : null;
    return {
      activeIndex,
      totalCards: cards.length,
      activeCards: active.length,
      activePlayStates,
      inactiveSamplePlayState: inactiveOrb
        ? getComputedStyle(inactiveOrb).animationPlayState
        : null,
    };
  }, VIEWPORT);
}

test.describe("Portfolio slider — data-active animation gating", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.describe.configure({ timeout: 120_000 });

  test("active card animates; inactive cards paused; survives last→first wrap", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });
    await skipWithoutPortfolio(page);
    const portfolio = page.locator("#portfolio");
    await expect(portfolio).toBeVisible({ timeout: 30_000 });
    await portfolio.scrollIntoViewIfNeeded();
    await expect(page.locator(VIEWPORT)).toBeVisible();

    /** Initial: middle anchor copy of card 1 — animations must be running. */
    const initial = await audit(page);
    // totalCards = slideCount × 3 loop copies; exact count depends on content.
    expect(initial.totalCards).toBeGreaterThanOrEqual(6); // at least 2 slides × 3 copies
    expect(initial.totalCards % 3).toBe(0); // always exactly 3 loop copies
    expect(initial.activeCards).toBe(3); // one per copy at active canonical index

    // Animation checks only apply to PortfolioCoverArt cards (.pc-orb--a).
    // Items with a coverImage render <img> instead — no orbs, no animation to gate.
    const hasOrbs = initial.activePlayStates.some((s) => s !== "no-orb");
    if (hasOrbs) {
      for (const state of initial.activePlayStates) {
        expect(state).toBe("running");
      }
      expect(initial.inactiveSamplePlayState).toBe("paused");
    }

    /** Reach the wrap region: dispatch ArrowRight on the focusable viewport.
     *  Six advances takes us from canonical 0 → past the last card → wrap to 0
     *  on the third copy (clone), the exact moment the original bug surfaced. */
    const viewport = page.locator(VIEWPORT);
    await viewport.focus();
    for (let i = 0; i < 6; i++) {
      await viewport.press("ArrowRight");
      await page.waitForTimeout(450); // > spring settle, < bored-user threshold
    }

    const afterWrap = await audit(page);
    expect(afterWrap.activeCards).toBe(3);
    /** After the wrap the visible card is a clone copy of canonical 0.
     *  With the fix it must still report `running` — when orbs are present. */
    if (hasOrbs) {
      for (const state of afterWrap.activePlayStates) {
        expect(state).toBe("running");
      }
      expect(afterWrap.inactiveSamplePlayState).toBe("paused");
    }
  });
});
