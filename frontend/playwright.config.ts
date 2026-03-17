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
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-android",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
      },
    },
    {
      name: "mobile-iphone-se",
      use: {
        ...devices["iPhone SE"],
      },
    },
    {
      name: "mobile-iphone-max",
      use: {
        ...devices["iPhone 14 Pro Max"],
      },
    },
  ],
});
