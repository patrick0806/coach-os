import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_BYPASS_AUTH: "true",
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
    {
      name: "smoke",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/*.smoke.spec.ts"],
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
