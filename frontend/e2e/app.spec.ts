import { expect, test } from "@playwright/test";

test("wallet connection, network switch, copy, and disconnect stay in wallet control", async ({ page }) => {
  const address = "0x1234567890123456789012345678901234567890";
  await page.addInitScript((account) => {
    let chainId = "0x1";
    let authorized = false;
    const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
    const provider = {
      request: async ({ method }: { method: string }) => {
        if (method === "eth_accounts") return authorized ? [account] : [];
        if (method === "eth_requestAccounts") { authorized = true; return [account]; }
        if (method === "eth_chainId") return chainId;
        if (method === "wallet_switchEthereumChain") { chainId = "0xf22f"; for (const listener of listeners.get("chainChanged") ?? []) listener(chainId); return null; }
        throw new Error(`Unexpected test wallet method: ${method}`);
      },
      on: (event: string, listener: (...args: unknown[]) => void) => listeners.set(event, [...(listeners.get(event) ?? []), listener]),
      removeListener: (event: string, listener: (...args: unknown[]) => void) => listeners.set(event, (listeners.get(event) ?? []).filter((current) => current !== listener)),
    };
    Object.defineProperty(window, "ethereum", { configurable: true, value: provider });
    Object.defineProperty(window.navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { (window as Window & { __copied?: string }).__copied = value; } } });
  }, address);
  await page.goto("/");
  await page.getByRole("button", { name: /connect wallet/i }).click();
  await page.getByRole("button", { name: /browser wallet/i }).click();
  await expect(page.getByRole("button", { name: /wrong network · switch/i })).toBeVisible();
  await page.getByRole("button", { name: /wrong network · switch/i }).click();
  await expect(page.getByRole("button", { name: /studionet · 61999/i })).toBeVisible();
  await page.getByRole("button", { name: /0x1234.*7890/i }).click();
  await page.getByRole("button", { name: /copy full address/i }).click();
  await expect(page.getByRole("status")).toContainText(/address copied/i);
  expect(await page.evaluate(() => (window as Window & { __copied?: string }).__copied)).toBe(address);
  await page.getByRole("button", { name: /disconnect/i }).click();
  await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
});

test("wallet chooser uses discovered injected providers instead of a bundled account", async ({ page }) => {
  const address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
  await page.addInitScript((account) => {
    let connected = false;
    const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
    const provider = {
      request: async ({ method }: { method: string }) => {
        if (method === "eth_accounts") return connected ? [account] : [];
        if (method === "eth_requestAccounts") { connected = true; return [account]; }
        if (method === "eth_chainId") return "0xf22f";
        throw new Error(`Unexpected wallet method ${method}`);
      },
      on: (event: string, listener: (...args: unknown[]) => void) => listeners.set(event, [...(listeners.get(event) ?? []), listener]),
      removeListener: (event: string, listener: (...args: unknown[]) => void) => listeners.set(event, (listeners.get(event) ?? []).filter((current) => current !== listener)),
    };
    window.addEventListener("eip6963:requestProvider", () => {
      window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: { info: { uuid: "test-injected-provider", name: "Test Injected Wallet", icon: "", rdns: "test.wallet" }, provider } }));
    });
  }, address);
  await page.goto("/");
  await page.getByRole("button", { name: /connect wallet/i }).click();
  await expect(page.getByRole("dialog", { name: /connect an injected wallet/i })).toContainText("Test Injected Wallet");
  await page.getByRole("button", { name: /test injected wallet/i }).click();
  await expect(page.getByRole("button", { name: /0xabcd.*abcd/i })).toBeVisible();
});

test("home shows canonical on-chain data or an explicit unavailable state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /progress is earned/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /program registry/i })).toBeVisible();
  await expect.poll(async () => (
    await page.getByText(/on-chain data unavailable/i).isVisible().catch(() => false)
    || await page.getByRole("link", { name: /PROGRAM #\d+/i }).first().isVisible().catch(() => false)
  ), { timeout: 20_000 }).toBe(true);
});

test("program creation wizard validates and reviews frozen tranches", async ({ page }) => {
  await page.goto("/create");
  await page.getByLabel("Program title").fill("E2E milestone program");
  await page.getByLabel("Recipient EVM address").fill("0x1111111111111111111111111111111111111111");
  await page.getByLabel("Purpose").fill("Verify an actual milestone result before releasing each tranche.");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.getByText(/PROGRAM BUILDER · STEP 2 OF 4/i)).toBeVisible();
  const tranches = page.getByLabel("Frozen tranche (GEN)");
  await tranches.nth(0).fill("1.25");
  await tranches.nth(1).fill("2.75");
  await page.getByRole("button", { name: /add criterion/i }).first().click();
  await page.getByRole("button", { name: /add criterion/i }).first().click();
  const criteria = page.getByLabel(/Acceptance clause for criterion/);
  await expect(criteria).toHaveCount(4);
  await criteria.nth(0).fill("Published release record confirms acceptance criteria one.");
  await criteria.nth(1).fill("Published release record confirms acceptance criteria two.");
  await criteria.nth(2).fill("Independent deployment record confirms the artifact is available.");
  await criteria.nth(3).fill("Second milestone record confirms the final artifact is available.");
  await page.getByRole("button", { name: /continue/i }).click();
  const source = page.getByLabel(/hostname and https path/i);
  await page.getByRole("button", { name: /add source/i }).first().click();
  await expect(source).toHaveCount(5);
  await source.nth(0).fill("https://example.org/project/");
  await source.nth(1).fill("https://records.example.net/project/");
  await source.nth(2).fill("https://another.example.org/project/");
  await source.nth(3).fill("https://evidence.example.net/project/");
  await source.nth(4).fill("https://official.example/status/");
  await page.getByLabel("Authority role").first().selectOption("OFFICIAL");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.getByText("4 GEN", { exact: true })).toBeVisible();
  await expect(page.getByText(/recipient accepts before any GEN is funded/i)).toBeVisible();
  await expect(page.getByText(/wallet shows the network fee before approval/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /prepare transaction/i })).toBeVisible();
});

test("treasury separates submitted transfers from recorded delivery", async ({ page }) => {
  await page.goto("/treasury");
  await expect(page.getByRole("heading", { name: /rejected-payment credit/i })).toBeVisible();
  await expect(page.getByText(/connect an injected wallet to inspect any credit/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /protocol treasury/i })).toBeVisible();
  await expect.poll(async () => (
    await page.getByText(/recipient transfer pending/i).isVisible().catch(() => false)
    || await page.getByText(/treasury read unavailable/i).isVisible().catch(() => false)
  ), { timeout: 20_000 }).toBe(true);
});

test("docs page links to current deployment evidence and states settlement limits", async ({ page }) => {
  await page.goto("/docs");
  await expect(page.getByText(/this branch adds recipient acceptance and exact post-acceptance funding/i)).toBeVisible();
  await expect(page.getByText(/it has not yet been deployed/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /read the live verification record/i }))
    .toHaveAttribute("href", "https://github.com/Ifem1/Ascende/blob/main/docs/LIVE_VERIFICATION.md");
  await expect(page.getByText(/no deployment or live transfer proof is published yet/i)).toHaveCount(0);
});

test("mobile layout has no horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
});
