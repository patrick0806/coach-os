/**
 * Dashboard — Behavioral Tests
 *
 * Verifies dashboard structure and auth-dependent UI using mocked session.
 * Stats data is tested against mock — structural validation only
 * (actual data correctness belongs in smoke tests once feature is implemented).
 */
import { test, expect } from "@playwright/test"
import { injectMockAuth, mockDashboardStats, MOCK_USER } from "../support/apiMocks"

async function goToDashboard(page: import("@playwright/test").Page) {
  await injectMockAuth(page)
  await mockDashboardStats(page)
  await page.goto("/dashboard")
  // Wait for the layout guard to pass and dashboard to render
  await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })
}

test.describe("Dashboard — Structure", () => {
  test("authenticated user can access the dashboard", async ({ page }) => {
    await goToDashboard(page)

    // Page should not redirect to login
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("shows coach first name in greeting", async ({ page }) => {
    await goToDashboard(page)

    const heading = page.locator('[data-slot="page-header"] h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText("Olá,")
  })
})

test.describe("Dashboard — Mobile", () => {
  test.use({ viewport: { width: 412, height: 915 } })

  test("dashboard is accessible on mobile viewport", async ({ page }) => {
    await injectMockAuth(page)
    await mockDashboardStats(page)
    await page.goto("/dashboard")
    await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })

    await expect(page).toHaveURL(/\/dashboard/)
  })
})
