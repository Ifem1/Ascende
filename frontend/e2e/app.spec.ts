import { expect, test } from "@playwright/test";

test("home shows Ascende's actual empty state without fabricated chain data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /progress is earned/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
  await expect(page.getByText(/on-chain data unavailable/i)).toBeVisible();
  await expect(page.getByText(/configure a verified studionet deployment address/i)).toBeVisible();
});

test("program creation wizard validates and reviews frozen tranches", async ({ page }) => {
  await page.goto("/create");
  await page.getByLabel("Program title").fill("E2E milestone program");
  await page.getByLabel("Recipient EVM address").fill("0x1111111111111111111111111111111111111111");
  await page.getByLabel("Purpose").fill("Verify an actual milestone result before releasing each tranche.");
  await page.getByRole("button", { name: /continue/i }).click();
  const tranches = page.getByLabel("Frozen tranche (GEN)");
  await tranches.nth(0).fill("1.25");
  await tranches.nth(1).fill("2.75");
  const criteria = page.getByLabel("Measurable acceptance clause");
  await criteria.nth(0).fill("Published release record confirms acceptance criteria one.");
  await criteria.nth(1).fill("Published release record confirms acceptance criteria two.");
  await page.getByRole("button", { name: /continue/i }).click();
  const source = page.getByLabel(/authorized https path prefix/i);
  await source.nth(0).fill("https://example.org/project/");
  await source.nth(1).fill("https://example.org/project/");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.getByText("4 GEN", { exact: true })).toBeVisible();
  await expect(page.getByText(/wallet shows the network fee before approval/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /prepare transaction/i })).toBeVisible();
});

test("mobile layout has no horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
});
