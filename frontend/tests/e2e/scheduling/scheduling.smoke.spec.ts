/**
 * Scheduling — Smoke Tests @smoke
 *
 * Tests availability rules, blocked dates, and appointments against a real backend.
 * Each test uses an isolated coach account.
 * Run with: npx playwright test --project=smoke
 */
import { test, expect } from "@playwright/test"
import { createIsolatedCoach, injectCoachSession } from "../support/testIsolation"

test.describe("Scheduling — Smoke @smoke", () => {
  // ---------------------------------------------------------------------------
  // Disponibilidade page
  // ---------------------------------------------------------------------------

  test("coach sees availability page with no rules on fresh account", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/disponibilidade")
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    // "Adicionar horário" button visible → page loaded
    await expect(page.getByTestId("add-rule-btn")).toBeVisible({ timeout: 10000 })
  })

  test("coach can open Add Rule dialog and create an availability rule", async ({
    page,
    request,
  }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/disponibilidade")
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    // Click "Adicionar horário"
    await page.getByTestId("add-rule-btn").click()

    // Dialog opens — form has default values (Monday 08:00–17:00)
    await page.waitForSelector("[data-testid='availability-rule-submit']", { timeout: 8000 })

    // Submit with default values
    await page.getByTestId("availability-rule-submit").click()

    // Rule appears in the list
    await expect(page.getByTestId("availability-rule-item").first()).toBeVisible({ timeout: 8000 })
  })

  test("coach can block a date on disponibilidade page", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/disponibilidade")
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    // Switch to "Datas bloqueadas" tab inside AvailabilitySection
    const blockedTab = page.getByRole("tab", { name: /datas bloqueadas/i })
    await blockedTab.waitFor({ state: "visible", timeout: 8000 })
    await blockedTab.click()

    // Click "Bloquear data" button
    await page.getByTestId("add-exception-btn").click()
    await page.waitForSelector("dialog, [role='dialog']", { timeout: 5000 })

    // Dialog appears
    await expect(page.locator("dialog, [role='dialog']").first()).toBeVisible()
  })

  // ---------------------------------------------------------------------------
  // Agenda page
  // ---------------------------------------------------------------------------

  test("coach sees agenda calendar", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/agenda")
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    // New appointment button should be visible
    await expect(page.getByTestId("new-appointment-btn")).toBeVisible({ timeout: 10000 })
  })

  test("coach can open New Appointment dialog", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/agenda")
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    await page.getByTestId("new-appointment-btn").click()
    await page.waitForSelector("dialog, [role='dialog']", { timeout: 8000 })
    await expect(page.locator("dialog, [role='dialog']").first()).toBeVisible()
  })
})
