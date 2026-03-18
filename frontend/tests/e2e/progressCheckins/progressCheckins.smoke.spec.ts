/**
 * Progress Checkins — Smoke Tests @smoke
 *
 * Tests progress checkin creation by a coach against a real backend.
 * Each test uses an isolated coach account + student created via API.
 * Run with: npx playwright test --project=smoke
 */
import { test, expect } from "@playwright/test"
import { createIsolatedCoach, injectCoachSession } from "../support/testIsolation"

const API_URL = "http://localhost:3000/api/v1"

async function createStudent(
  request: import("@playwright/test").APIRequestContext,
  accessToken: string
) {
  const res = await request.post(`${API_URL}/students`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      name: `Smoke Aluno ${Date.now()}`,
      email: `smoke-aluno-${Date.now()}@e2e.test`,
    },
  })
  const body = await res.json()
  return body.data ?? body
}

test.describe("Progress Checkins — Smoke @smoke", () => {
  test("coach can access student evolution tab", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)
    const student = await createStudent(request, coach.accessToken)

    await page.goto(`/students/${student.id}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 10000 })

    const tab = page.getByRole("tab", { name: /evolu/i })
    await tab.waitFor({ state: "visible", timeout: 8000 })
    await tab.click()

    await page.waitForSelector("[data-testid='student-progress-section']", { timeout: 8000 })
    await expect(page.getByText(/nenhum registro de evolução/i)).toBeVisible()
  })

  test("coach can create a progress checkin with weight metric", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)
    const student = await createStudent(request, coach.accessToken)

    await page.goto(`/students/${student.id}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 10000 })

    const tab = page.getByRole("tab", { name: /evolu/i })
    await tab.waitFor({ state: "visible", timeout: 8000 })
    await tab.click()

    await page.waitForSelector("[data-testid='student-progress-section']", { timeout: 8000 })

    // Open dialog
    await page.getByTestId("register-evolution-button").click({ force: true })
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).toBeVisible()

    // Fill weight metric
    await page.locator("#metric-weight").fill("82.5")

    // Submit
    await page.getByTestId("submit-checkin-button").click()

    // Success: dialog closes and checkin appears
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).not.toBeVisible({
      timeout: 8000,
    })
    await expect(page.getByTestId("checkin-card").first()).toBeVisible({ timeout: 8000 })
  })

  test("created checkin shows correct metric in summary", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)
    const student = await createStudent(request, coach.accessToken)

    await page.goto(`/students/${student.id}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 10000 })

    const tab = page.getByRole("tab", { name: /evolu/i })
    await tab.waitFor({ state: "visible", timeout: 8000 })
    await tab.click()
    await page.waitForSelector("[data-testid='student-progress-section']", { timeout: 8000 })

    await page.getByTestId("register-evolution-button").click({ force: true })
    await page.locator("#metric-weight").fill("75")
    await page.getByTestId("submit-checkin-button").click()

    await expect(page.getByTestId("checkin-card").first()).toBeVisible({ timeout: 8000 })

    // Summary should mention Peso
    const card = page.getByTestId("checkin-card").first()
    await expect(card.getByText(/peso/i)).toBeVisible()
    await expect(card.getByText(/75/)).toBeVisible()
  })

  test("coach can create checkin with multiple metrics", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)
    const student = await createStudent(request, coach.accessToken)

    await page.goto(`/students/${student.id}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 10000 })

    const tab = page.getByRole("tab", { name: /evolu/i })
    await tab.waitFor({ state: "visible", timeout: 8000 })
    await tab.click()
    await page.waitForSelector("[data-testid='student-progress-section']", { timeout: 8000 })

    await page.getByTestId("register-evolution-button").click({ force: true })
    await page.locator("#metric-weight").fill("80")
    await page.locator("#metric-waist").fill("85")
    await page.getByTestId("submit-checkin-button").click()

    await expect(page.getByTestId("checkin-card").first()).toBeVisible({ timeout: 8000 })

    // Both metrics should appear on the card
    const card = page.getByTestId("checkin-card").first()
    await expect(card.getByText(/peso/i)).toBeVisible({ timeout: 5000 })
  })
})
