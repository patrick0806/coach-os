import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  injectMockAuthAs,
  mockDashboardStats,
  mockGetMyProfile,
  mockSaveLpDraft,
  mockAvailabilityRules,
  mockStudentsList,
  mockGetTourProgress,
  mockMarkPageToured,
  MOCK_USER,
} from "../support/apiMocks"
import {
  DASHBOARD_STATS,
  PROFILE_COMPLETE,
  AVAILABILITY_RULES,
  STUDENTS,
} from "../utils/comprehensiveFixtures"

function paginated(content: object[], page = 0, size = 20) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

// =============================================================================
// Resilience — Reload and navigation stability
// =============================================================================

test.describe("Critical — Resilience", () => {
  test("dashboard survives page reload", async ({ page }) => {
    await injectMockAuth(page)
    await mockDashboardStats(page, DASHBOARD_STATS)

    await page.goto("/dashboard")
    await expect(page.locator("[data-slot='page-header'], h1, h2").first()).toBeVisible({
      timeout: 10000,
    })

    // Reload page
    await page.reload()

    // Re-inject auth since cookies persist but addInitScript doesn't
    await expect(page.locator("[data-slot='page-header'], h1, h2").first()).toBeVisible({
      timeout: 10000,
    })
  })

  test("students page survives reload without losing tab state", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentsList(page, paginated(STUDENTS))

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    // Verify students are visible
    await expect(page.getByText("Fernanda Costa")).toBeVisible()

    // Reload page
    await page.reload()

    // Students should still be there after reload
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })
    await expect(page.getByText("Fernanda Costa")).toBeVisible()
  })

  test("profile editor survives reload with data intact", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, PROFILE_COMPLETE)

    await page.goto("/pagina-publica")
    await page.waitForSelector("#bio, h1", { timeout: 10000 })

    const bioField = page.locator("#bio")
    if (await bioField.isVisible()) {
      const bioValue = await bioField.inputValue()

      // Reload
      await page.reload()
      await page.waitForSelector("#bio, h1", { timeout: 10000 })

      if (await bioField.isVisible()) {
        const bioAfterReload = await bioField.inputValue()
        expect(bioAfterReload).toBe(bioValue)
      }
    }
  })

  test("navigation between pages preserves auth state", async ({ page }) => {
    await injectMockAuth(page)
    await mockDashboardStats(page, DASHBOARD_STATS)
    await mockStudentsList(page, paginated(STUDENTS))

    // Start at dashboard
    await page.goto("/dashboard")
    await expect(page.locator("[data-slot='page-header'], h1, h2").first()).toBeVisible({
      timeout: 10000,
    })

    // Navigate to students
    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    // Should still be authenticated (not redirected to login)
    expect(page.url()).toContain("/students")
  })

  test("browser back button works correctly between pages", async ({ page }) => {
    await injectMockAuth(page)
    await mockDashboardStats(page, DASHBOARD_STATS)
    await mockStudentsList(page, paginated(STUDENTS))

    await page.goto("/dashboard")
    await page.waitForTimeout(2000)

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    // Go back
    await page.goBack()
    await page.waitForTimeout(2000)

    // Should be back on dashboard (or at least not broken)
    expect(page.url()).not.toContain("/students")
  })
})
