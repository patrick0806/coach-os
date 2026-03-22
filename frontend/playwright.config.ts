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
    // --- Behavioral tests (API mocked via page.route — no backend required) ---
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Exclude smoke tests from default runs — they require a live backend
      testIgnore: ["**/*.smoke.spec.ts"],
    },
    {
      name: "mobile-android",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
      },
      testIgnore: ["**/*.smoke.spec.ts"],
    },

    // --- Smoke tests (real backend required) ---
    // Run with: npx playwright test --project=smoke
    // Workers limited to 2 to avoid hitting rate limits on auth endpoints (3 req/min)
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
