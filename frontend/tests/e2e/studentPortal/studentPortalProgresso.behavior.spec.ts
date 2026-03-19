/**
 * Student Portal — Progresso Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 * Tests cover: list display, empty state, create dialog, form interactions.
 */
import { test, expect } from "@playwright/test"
import {
  injectStudentMockAuth,
  mockStudentMyCheckins,
  mockStudentMyCheckinsStateful,
  mockCreateStudentCheckin,
} from "../support/apiMocks"
import { studentCheckinFixtures } from "../fixtures/studentPortal.fixtures"

const PAGE_URL = "/aluno/progresso"

async function setupPage(
  page: import("@playwright/test").Page,
  fixture: object = studentCheckinFixtures.withCheckins
) {
  await injectStudentMockAuth(page)
  await mockStudentMyCheckins(page, fixture)
  await page.goto(PAGE_URL)
  await page.waitForSelector("[data-testid='checkins-page']", { timeout: 8000 })
}

// =============================================================================
// Load & Header
// =============================================================================

test.describe("Student Progresso — Header", () => {
  test("renders Meu Progresso heading", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Meu Progresso" })).toBeVisible()
  })

  test("renders Registrar button", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("add-checkin-button")).toBeVisible()
  })
})

// =============================================================================
// Empty State
// =============================================================================

test.describe("Student Progresso — Empty State", () => {
  test("shows empty state when no checkins exist", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await expect(page.getByText("Nenhum registro de progresso")).toBeVisible()
  })

  test("shows empty state description", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await expect(page.getByText(/Registre sua evolução/i)).toBeVisible()
  })

  test("Registrar button is visible in empty state", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await expect(page.getByTestId("add-checkin-button")).toBeVisible()
  })
})

// =============================================================================
// List Display
// =============================================================================

test.describe("Student Progresso — List", () => {
  test("renders checkin cards", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("checkin-card").first()).toBeVisible()
  })

  test("renders correct number of checkin cards", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("checkin-card")).toHaveCount(2)
  })

  test("shows checkin date in Portuguese format", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.single)
    // "2026-01-15" → "15 de janeiro de 2026"
    await expect(page.getByText(/janeiro/i)).toBeVisible()
  })

  test("shows metric summary on checkin card", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.single)
    // checkinWithMetrics has weight=80.50 kg
    await expect(page.getByText(/Peso/i).first()).toBeVisible()
    await expect(page.getByText(/80\.50/i).first()).toBeVisible()
  })

  test("shows photo count when checkin has photos", async ({ page }) => {
    await setupPage(page)
    // Second checkin has 1 photo
    await expect(page.getByText(/1 foto/i)).toBeVisible()
  })

  test("shows record count badge on checkin card", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.single)
    // checkinWithMetrics has 2 records → "2 registros"
    await expect(page.getByText("2 registros")).toBeVisible()
  })
})

// =============================================================================
// Expand / Collapse
// =============================================================================

test.describe("Student Progresso — Expand Checkin", () => {
  test("expand button is visible on card with data", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.single)
    await expect(page.getByTestId("expand-checkin").first()).toBeVisible()
  })

  test("clicking expand shows metric details", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.single)
    await page.getByTestId("expand-checkin").first().click()
    await expect(page.getByText("Métricas")).toBeVisible()
  })

  test("clicking expand again collapses the card", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.single)
    await page.getByTestId("expand-checkin").first().click()
    await expect(page.getByText("Fechar")).toBeVisible()
    await page.getByText("Fechar").click()
    await expect(page.getByText("Ver detalhes")).toBeVisible()
  })
})

// =============================================================================
// Create Dialog
// =============================================================================

test.describe("Student Progresso — Create Dialog", () => {
  test("opens dialog when clicking Registrar button", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).toBeVisible()
  })

  test("dialog shows Métricas section", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await expect(page.getByText("Métricas", { exact: true })).toBeVisible()
  })

  test("dialog shows metric input fields", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await expect(page.locator("#metric-weight")).toBeVisible()
    await expect(page.locator("#metric-body_fat")).toBeVisible()
    await expect(page.locator("#metric-waist")).toBeVisible()
  })

  test("dialog shows Fotos section", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await expect(page.getByText("Fotos", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: /Adicionar fotos/i })).toBeVisible()
  })

  test("submit button is disabled when no data is entered", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await expect(page.getByTestId("submit-checkin-button")).toBeDisabled()
  })

  test("submit button becomes enabled after filling a metric", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await page.locator("#metric-weight").fill("80")
    await expect(page.getByTestId("submit-checkin-button")).toBeEnabled()
  })

  test("can fill weight metric value", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await page.locator("#metric-weight").fill("82.5")
    await expect(page.locator("#metric-weight")).toHaveValue("82.5")
  })

  test("can fill notes field", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await page.locator("#checkin-notes").fill("Semana de adaptação")
    await expect(page.locator("#checkin-notes")).toHaveValue("Semana de adaptação")
  })

  test("closes dialog when clicking Cancelar", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).toBeVisible()

    await page.getByRole("button", { name: "Cancelar" }).click()
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).not.toBeVisible()
  })

  test("resets form after closing", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)

    // Open, fill, close
    await page.getByTestId("add-checkin-button").click()
    await page.locator("#metric-weight").fill("80")
    await page.getByRole("button", { name: "Cancelar" }).click()

    // Reopen
    await page.getByTestId("add-checkin-button").click()
    await expect(page.locator("#metric-weight")).toHaveValue("")
  })
})

// =============================================================================
// Create — Success Flow
// =============================================================================

test.describe("Student Progresso — Create Success", () => {
  test("creates checkin and list updates", async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockStudentMyCheckinsStateful(
      page,
      studentCheckinFixtures.empty,
      studentCheckinFixtures.single
    )
    await mockCreateStudentCheckin(page, studentCheckinFixtures.single.content[0])
    await page.goto(PAGE_URL)
    await page.waitForSelector("[data-testid='checkins-page']", { timeout: 8000 })

    await page.getByTestId("add-checkin-button").click()
    await page.locator("#metric-weight").fill("80")
    await page.getByTestId("submit-checkin-button").click()

    // List refetches and shows the new checkin
    await expect(page.getByTestId("checkin-card").first()).toBeVisible({ timeout: 8000 })
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Student Progresso — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("renders heading and button on mobile", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Meu Progresso" })).toBeVisible()
    await expect(page.getByTestId("add-checkin-button")).toBeVisible()
  })

  test("shows checkin cards on mobile", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("checkin-card").first()).toBeVisible()
  })

  test("dialog opens on mobile", async ({ page }) => {
    await setupPage(page, studentCheckinFixtures.empty)
    await page.getByTestId("add-checkin-button").click()
    await expect(page.getByRole("heading", { name: "Registrar Evolução" })).toBeVisible()
  })
})
