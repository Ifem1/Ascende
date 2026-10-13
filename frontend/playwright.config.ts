import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? (process.env.CI ? "3000" : "3105");
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? undefined : 1,
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [process.env.CI
    ? { name: "chromium", use: { ...devices["Desktop Chrome"] } }
    : { name: "edge", use: { ...devices["Desktop Chrome"], channel: "msedge" } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS: "" },
  },
});
