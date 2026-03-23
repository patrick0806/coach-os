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
    // --- Core behavioral suite: short, high-signal journeys for daily use ---
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

    // --- Full mocked behavioral suite (feature-level detail) ---
    {
      name: "full-web",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/*.smoke.spec.ts", "**/core/**"],
    },
    {
      name: "full-mobile",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
      },
      testIgnore: ["**/*.smoke.spec.ts", "**/core/**"],
    },

    // --- Smoke tests (real backend required) ---
    // Run with: npm run test:e2e:smoke (uses --workers=1 to avoid 429 on /auth/register)
    {
      name: "smoke",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/*.smoke.spec.ts"],
      fullyParallel: false,
    },

    // webkit (Safari) requires a separate installation: npx playwright install webkit
    // Disabled until webkit is installed in the environment
    // {
    //   name: "mobile-iphone-se",
    //   use: { ...devices["iPhone SE"] },
    // },
    // {
    //   name: "mobile-iphone-max",
    //   use: { ...devices["iPhone 14 Pro Max"] },
    // },
  ],
});
