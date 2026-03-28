import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3099",
    trace: "on-first-retry",
  },
  webServer: {
    // In CI: use the already-built production server (much faster startup)
    // Locally: use dev server for hot reload
    // Port 3099 is dedicated to E2E tests — avoids reusing the dev server
    // on 3001 which may not have E2E_BYPASS_AUTH set.
    command: process.env.CI
      ? "npx next start --port 3099"
      : "npm run dev -- --port 3099",
    url: "http://localhost:3099",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: "3099",
      E2E_BUILD: "true",
      E2E_BYPASS_AUTH: "true",
      NEXT_PUBLIC_SHOW_TUTORIAL: "true",
      ...(process.env.CI && {
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:3333",
      }),
    },
  },
  projects: [
    // --- Core behavioral suite: ~45 high-signal tests for daily CI ---
    {
      name: "core-web",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/core/*.behavior.spec.ts"],
    },
    {
      name: "core-mobile",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
      },
      testMatch: ["**/core/*.mobile.spec.ts"],
    },

    // --- Smoke tests (real backend required) ---
    // Run with: npm run test:e2e:smoke (uses --workers=1 to avoid 429 on /auth/register)
    {
      name: "smoke",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/*.smoke.spec.ts"],
      fullyParallel: false,
    },
  ],
});
