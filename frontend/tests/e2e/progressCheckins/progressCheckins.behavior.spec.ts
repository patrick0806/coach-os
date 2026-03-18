/**
 * Progress Checkins — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 */
import { test, expect } from "@playwright/test"
import { injectMockAuth, mockGet, mockGetStateful } from "../support/apiMocks"
import { progressCheckinsFixtures, MOCK_STUDENT_ID } from "../fixtures/progressCheckins.fixtures"

const STUDENT_URL = `/students/${MOCK_STUDENT_ID}`
const API_STUDENT = `**/api/v1/students/${MOCK_STUDENT_ID}`
const API_CHECKINS = `**/api/v1/students/${MOCK_STUDENT_ID}/progress-checkins*`
const API_DELETE = `**/api/v1/progress-checkins/**`

const mockStudent = {
  id: MOCK_STUDENT_ID,
  name: "João Silva",
  email: "joao@test.com",
  phoneNumber: null,
  goal: null,
  observations: null,
  physicalRestrictions: null,
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
}

async function setupCheckinPage(
  page: import("@playwright/test").Page,
  fixture: object,
) {
  await injectMockAuth(page)
  await mockGet(page, API_STUDENT, mockStudent)
  await mockGet(page, API_CHECKINS, fixture)
  // Mock other student detail related calls
  await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/notes*`, {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  })
  await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/programs*`, {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  })
  await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules*`, [])
  await mockGet(page, `**/api/v1/appointments*`, {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  })
  await page.goto(STUDENT_URL)
}

async function navigateToEvolution(page: import("@playwright/test").Page) {
  // The tab trigger has value="progress" and label "Evolução"
  const tab = page.getByRole("tab", { name: /evolu/i })
  await tab.waitFor({ state: "visible", timeout: 8000 })
  await tab.click()
  await page.waitForSelector("[data-testid='student-progress-section']", {
    timeout: 8000,
  })
}

// =============================================================================
// Empty State
// =============================================================================

test.describe("Progress Checkins — Empty State", () => {
  test("shows empty state when no checkins exist", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.empty)
    await navigateToEvolution(page)

    await expect(page.getByText("Nenhum registro de evolução")).toBeVisible()
    await expect(page.getByTestId("register-evolution-button")).toBeVisible()
  })
})

// =============================================================================
// List
// =============================================================================

test.describe("Progress Checkins — List", () => {
  test("renders checkin cards", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.withCheckins)
    await navigateToEvolution(page)

    await expect(page.getByTestId("checkin-card").first()).toBeVisible()
  })

  test("shows metric badges on checkin cards", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.withCheckins)
    await navigateToEvolution(page)

    await expect(page.getByText(/Peso:/).first()).toBeVisible()
    await expect(page.getByText(/80/).first()).toBeVisible()
  })

  test("shows checkin date in portuguese format", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.withCheckins)
    await navigateToEvolution(page)

    // "2026-01-15" → "15 de janeiro de 2026"
    await expect(page.getByText(/janeiro/i).first()).toBeVisible()
  })

  test("shows multiple checkin cards", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.withCheckins)
    await navigateToEvolution(page)

    await expect(page.getByTestId("checkin-card")).toHaveCount(2)
  })
})

// =============================================================================
// Create Dialog
// =============================================================================

test.describe("Progress Checkins — Create Dialog", () => {
  test("opens create checkin dialog when clicking register button", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.empty)
    await navigateToEvolution(page)

    await page.getByTestId("register-evolution-button").click({ force: true })
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).toBeVisible()
    await expect(page.getByText("Métricas")).toBeVisible()
  })

  test("dialog shows all metric fields", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.empty)
    await navigateToEvolution(page)

    await page.getByTestId("register-evolution-button").click({ force: true })

    await expect(page.locator("#metric-weight")).toBeVisible()
    await expect(page.locator("#metric-body_fat")).toBeVisible()
    await expect(page.locator("#metric-waist")).toBeVisible()
  })

  test("can fill metric values in the dialog", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.empty)
    await navigateToEvolution(page)

    await page.getByTestId("register-evolution-button").click({ force: true })
    const weightInput = page.locator("#metric-weight")
    await weightInput.fill("80")
    await expect(weightInput).toHaveValue("80")
  })

  test("submit button is disabled when no data is entered", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.empty)
    await navigateToEvolution(page)

    await page.getByTestId("register-evolution-button").click({ force: true })
    await expect(page.getByTestId("submit-checkin-button")).toBeDisabled()
  })

  test("submit button becomes enabled after filling a metric", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.empty)
    await navigateToEvolution(page)

    await page.getByTestId("register-evolution-button").click({ force: true })
    await page.locator("#metric-weight").fill("80")
    await expect(page.getByTestId("submit-checkin-button")).toBeEnabled()
  })

  test("closes dialog when clicking cancel", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.empty)
    await navigateToEvolution(page)

    await page.getByTestId("register-evolution-button").click({ force: true })
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).toBeVisible()

    await page.getByRole("button", { name: "Cancelar" }).click({ force: true })
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).not.toBeVisible()
  })
})

// =============================================================================
// Delete
// =============================================================================

test.describe("Progress Checkins — Delete", () => {
  test("shows delete confirmation dialog", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.withCheckins)
    await navigateToEvolution(page)

    await page.getByTestId("delete-checkin-button").first().click({ force: true })
    await expect(page.getByText("Remover registro de evolução")).toBeVisible()
    await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Remover" })).toBeVisible()
  })

  test("cancelling the confirmation does not delete the checkin", async ({ page }) => {
    await setupCheckinPage(page, progressCheckinsFixtures.withCheckins)
    await navigateToEvolution(page)

    await page.getByTestId("delete-checkin-button").first().click({ force: true })
    await page.getByRole("button", { name: "Cancelar" }).click()

    // Cards should still be visible
    await expect(page.getByTestId("checkin-card").first()).toBeVisible()
  })

  test("deletes checkin after confirmation and updates list", async ({ page }) => {
    await injectMockAuth(page)
    await mockGet(page, API_STUDENT, mockStudent)
    await mockGetStateful(
      page,
      API_CHECKINS,
      progressCheckinsFixtures.withCheckins,
      { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    )
    await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/notes*`, {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    })
    await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/programs*`, {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    })
    await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules*`, [])
    await mockGet(page, `**/api/v1/appointments*`, {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    })
    await page.route(API_DELETE, (route) => {
      if (route.request().method() === "DELETE") {
        route.fulfill({ status: 204 })
      } else {
        route.fallback()
      }
    })

    await page.goto(STUDENT_URL)
    await navigateToEvolution(page)

    await page.getByTestId("delete-checkin-button").first().click({ force: true })
    await page.getByRole("button", { name: "Remover" }).click()

    await expect(page.getByText("Nenhum registro de evolução")).toBeVisible({
      timeout: 8000,
    })
  })
})
