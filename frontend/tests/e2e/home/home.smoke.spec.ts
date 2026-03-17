/**
 * Home Page — Smoke Tests @smoke
 *
 * Tests content that requires a live backend (pricing plans loaded server-side).
 * Run with: npx playwright test --project=smoke
 */
import { test, expect } from "@playwright/test"

test.describe("Home Page — Plans Section @smoke", () => {
  test("loads pricing plans from API with BRL prices", async ({ page }) => {
    await page.goto("/")

    const plansSection = page.locator("#planos")
    await expect(plansSection).toBeVisible()

    const planCards = plansSection.locator('[data-slot="plan-card"]')
    await expect(planCards.first()).toBeVisible({ timeout: 10000 })
    expect(await planCards.count()).toBeGreaterThanOrEqual(1)

    await expect(plansSection.getByText(/R\$/).first()).toBeVisible()
  })
})
