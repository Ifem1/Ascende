import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000", trace: "retain-on-failure" },
  projects: [process.env.CI
    ? { name: "chromium", use: { ...devices["Desktop Chrome"] } }
    : { name: "edge", use: { ...devices["Desktop Chrome"], channel: "msedge" } }],
  webServer: {
    command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${process.env.PLAYWRIGHT_PORT ?? "3000"}`,
    url: process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? "3000"}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS: "" },
  },
});
