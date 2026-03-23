/**
 * Onboarding Tutorial — Behavioral Tests
 *
 * Verifies checklist widget and Tutorial header button behavior using mocked API.
 * All tests require NEXT_PUBLIC_SHOW_TUTORIAL=true (set in playwright.config.ts webServer.env).
 *
 * Note: The SHOW_TUTORIAL=false scenario cannot be tested per-test because the constant
 * is baked at Next.js build/dev-server startup time. To verify that scenario,
 * restart the dev server without NEXT_PUBLIC_SHOW_TUTORIAL and manually confirm
 * no onboarding UI renders.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuthAs,
  mockDashboardStats,
  mockGetTourProgress,
  mockMarkPageToured,
  mockGet,
} from "../support/apiMocks"
import {
  MOCK_USER_NEW,
  MOCK_USER_ONBOARDED,
  MOCK_ADMIN_USER,
  MOCK_NO_COMPLETED_PAGES,
  MOCK_PARTIAL_COMPLETED_PAGES,
  MOCK_ALL_COMPLETED_PAGES,
} from "../fixtures/onboarding.fixtures"

async function goToDashboard(
  page: import("@playwright/test").Page,
  user: object,
  completedPages: string[] = []
) {
  await injectMockAuthAs(page, user)
  await mockDashboardStats(page)
  await mockGetTourProgress(page, completedPages)
  await mockMarkPageToured(page, completedPages)
  await page.goto("/dashboard")
  await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })
}

async function goToExercises(page: import("@playwright/test").Page, user: object) {
  await injectMockAuthAs(page, user)
  await mockGetTourProgress(page, [])
  await mockMarkPageToured(page, ["exercises"])
  await mockGet(page, "**/api/v1/exercises*", {
    content: [],
    page: 0,
    size: 9,
    totalElements: 0,
    totalPages: 0,
  })
  await mockGet(page, "**/api/v1/enums/muscle-groups*", [])
  await page.goto("/exercises")
  await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })
}

// =============================================================================
// Checklist — visibility
// =============================================================================

test.describe("Onboarding Checklist — Visibility", () => {
  test("shows checklist for new PERSONAL user with SHOW_TUTORIAL active", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_NO_COMPLETED_PAGES)

    await expect(page.getByTestId("onboarding-checklist")).toBeVisible()
    await expect(page.getByText("Primeiros passos")).toBeVisible()
  })

  test("hides checklist when onboardingCompleted is true", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_ONBOARDED, MOCK_NO_COMPLETED_PAGES)

    await expect(page.getByTestId("onboarding-checklist")).not.toBeVisible()
  })

  test("hides checklist when all tour pages are completed even if onboardingCompleted is false", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_ALL_COMPLETED_PAGES)

    await expect(page.getByTestId("onboarding-checklist")).not.toBeVisible()
  })

  test("hides checklist for ADMIN role", async ({ page }) => {
    await goToDashboard(page, MOCK_ADMIN_USER, MOCK_NO_COMPLETED_PAGES)

    await expect(page.getByTestId("onboarding-checklist")).not.toBeVisible()
  })

  test("checklist can be dismissed by clicking X", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_NO_COMPLETED_PAGES)

    const checklist = page.getByTestId("onboarding-checklist")
    await expect(checklist).toBeVisible()

    await checklist.getByRole("button").click()

    await expect(checklist).not.toBeVisible()
  })
})

// =============================================================================
// Checklist — progress state
// =============================================================================

test.describe("Onboarding Checklist — Progress", () => {
  test("shows 0/8 progress when no pages visited", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_NO_COMPLETED_PAGES)

    const checklist = page.getByTestId("onboarding-checklist")
    await expect(checklist.getByText("0 de 8 módulos visitados")).toBeVisible()
  })

  test("shows correct count when some pages are completed", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_PARTIAL_COMPLETED_PAGES)

    const checklist = page.getByTestId("onboarding-checklist")
    // Wait for the API response to update from placeholder (0) to actual count (3)
    await expect(checklist.getByText("3 de 8 módulos visitados")).toBeVisible({ timeout: 8000 })
  })

  test("completed pages appear with strikethrough style", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_PARTIAL_COMPLETED_PAGES)

    const checklist = page.getByTestId("onboarding-checklist")
    // Wait for API response to update completed state
    await expect(checklist.getByText("3 de 8 módulos visitados")).toBeVisible({ timeout: 8000 })

    // "Biblioteca de Exercícios" is in MOCK_PARTIAL_COMPLETED_PAGES
    const completedItem = checklist.getByText("Biblioteca de Exercícios")
    await expect(completedItem).toHaveClass(/line-through/)
  })

  test("pending pages appear without strikethrough", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_PARTIAL_COMPLETED_PAGES)

    const checklist = page.getByTestId("onboarding-checklist")
    // Wait for API response
    await expect(checklist.getByText("3 de 8 módulos visitados")).toBeVisible({ timeout: 8000 })

    // "Disponibilidade" is NOT in MOCK_PARTIAL_COMPLETED_PAGES
    const pendingItem = checklist.getByText("Disponibilidade")
    await expect(pendingItem).not.toHaveClass(/line-through/)
  })

  test("all 8 module links are rendered inside the checklist", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_NO_COMPLETED_PAGES)

    const checklist = page.getByTestId("onboarding-checklist")
    await expect(checklist).toBeVisible()

    const labels = [
      "Biblioteca de Exercícios",
      "Alunos",
      "Programas de Treino",
      "Agenda",
      "Disponibilidade",
      "Planos de Serviço",
      "Página Pública",
      "Configurações",
    ]

    for (const label of labels) {
      await expect(checklist.getByText(label)).toBeVisible()
    }
  })
})

// =============================================================================
// Tutorial header button
// =============================================================================

test.describe("Onboarding Header Button", () => {
  test("shows Tutorial button for PERSONAL on a tour page", async ({ page }) => {
    await goToExercises(page, MOCK_USER_NEW)

    await expect(page.getByRole("button", { name: /tutorial/i })).toBeVisible()
  })

  test("hides Tutorial button for ADMIN role", async ({ page }) => {
    await goToExercises(page, MOCK_ADMIN_USER)

    await expect(page.getByRole("button", { name: /tutorial/i })).not.toBeVisible()
  })

  test("hides Tutorial button on pages without a tour (dashboard)", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_NO_COMPLETED_PAGES)

    await expect(page.getByRole("button", { name: /tutorial/i })).not.toBeVisible()
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Onboarding — Mobile", () => {
  test.use({ viewport: { width: 412, height: 915 } })

  test("checklist is visible on mobile for new user", async ({ page }) => {
    await goToDashboard(page, MOCK_USER_NEW, MOCK_NO_COMPLETED_PAGES)

    await expect(page.getByTestId("onboarding-checklist")).toBeVisible()
  })
})
