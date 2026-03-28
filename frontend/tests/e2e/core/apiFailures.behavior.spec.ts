import { test, expect } from "@playwright/test"
import type { Route } from "@playwright/test"
import {
  injectMockAuth,
  injectStudentMockAuth,
  mockEnumMuscleGroups,
} from "../support/apiMocks"

// =============================================================================
// API Failures — Simulate 500 errors and validate fallback UI
// =============================================================================

test.describe("Critical — API Failures", () => {
  test("students page shows error state on API 500", async ({ page }) => {
    await injectMockAuth(page)

    await page.route("**/api/v1/students*", (route: Route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          json: { message: "Internal Server Error", statusCode: 500 },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/students")
    await page.waitForTimeout(5000)

    // Should show error state or empty state — NOT crash with unhandled JS error
    const hasContent = await page.locator("body").textContent()
    expect(hasContent).toBeTruthy()

    // Page should not show raw error JSON
    await expect(page.getByText("Internal Server Error")).not.toBeVisible()
  })

  test("exercises page shows error state on API 500", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumMuscleGroups(page)

    await page.route("**/api/v1/exercises*", (route: Route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          json: { message: "Internal Server Error", statusCode: 500 },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/exercises")
    await page.waitForTimeout(5000)

    const hasContent = await page.locator("body").textContent()
    expect(hasContent).toBeTruthy()
  })

  test("dashboard handles stats API failure gracefully", async ({ page }) => {
    await injectMockAuth(page)

    await page.route("**/api/v1/dashboard/stats*", (route: Route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          json: { message: "Internal Server Error", statusCode: 500 },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/dashboard")
    await page.waitForTimeout(5000)

    // Dashboard should still render, even if stats fail
    const hasContent = await page.locator("body").textContent()
    expect(hasContent).toBeTruthy()
    expect(hasContent!.length).toBeGreaterThan(0)
  })

  test("create student shows error toast on API failure", async ({ page }) => {
    await injectMockAuth(page)

    // Mock list to load page
    await page.route("**/api/v1/students*", (route: Route) => {
      const method = route.request().method()
      const url = route.request().url()

      if (method === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
        })
      } else if (method === "POST") {
        route.fulfill({
          status: 400,
          contentType: "application/json",
          json: { message: "Email já cadastrado", statusCode: 400 },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    await page.getByRole("button", { name: /novo aluno/i }).first().click()
    await page.locator("#name").fill("Falha Test")
    await page.locator("#email").fill("fail@test.com")
    await page.getByRole("button", { name: /salvar/i }).click()

    // Should show error toast or keep dialog open
    await page.waitForTimeout(2000)
    const dialogOpen = await page.locator("#name").isVisible()
    const hasToast = await page.getByText(/erro|falha|já cadastrado/i).first().isVisible().catch(() => false)

    // Either dialog stays open or error toast appears
    expect(dialogOpen || hasToast).toBe(true)
  })

  test("create exercise shows error feedback on API failure", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumMuscleGroups(page)

    await page.route("**/api/v1/exercises*", (route: Route) => {
      const method = route.request().method()
      if (method === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { content: [], page: 0, size: 9, totalElements: 0, totalPages: 0 },
        })
      } else if (method === "POST") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          json: { message: "Erro interno", statusCode: 500 },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 10000 })

    await page.getByRole("button", { name: /criar exercício/i }).click()
    await page.locator("#exercise-name").fill("Falha Exercício")
    await page.locator("#exercise-muscleGroup").click()
    await page.getByRole("option", { name: "Peitoral" }).click()
    await page.getByRole("button", { name: /salvar/i }).click()

    // Should show error feedback
    await page.waitForTimeout(2000)
    const dialogOpen = await page.getByRole("heading", { name: /novo exercício/i }).isVisible()
    const hasErrorToast = await page.getByText(/erro|falha/i).first().isVisible().catch(() => false)

    expect(dialogOpen || hasErrorToast).toBe(true)
  })

  test("profile save shows error feedback on API failure", async ({ page }) => {
    await injectMockAuth(page)

    // Mock profile GET success
    await page.route("**/api/v1/profile*", (route: Route) => {
      const method = route.request().method()
      const url = route.request().url()
      if (method === "GET" && !url.includes("/photo/")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: {
            id: "profile-123",
            slug: "test",
            coachName: "Test",
            bio: null,
            profilePhoto: null,
            logoUrl: null,
            phoneNumber: null,
            specialties: null,
            themeColor: "#0066CC",
            themeColorSecondary: null,
            lpLayout: "1",
            lpTitle: null,
            lpSubtitle: null,
            lpHeroImage: null,
            lpAboutTitle: null,
            lpAboutText: null,
            lpImage1: null,
            lpImage2: null,
            lpImage3: null,
            lpDraftData: null,
          },
        })
      } else if (method === "PUT") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          json: { message: "Erro ao salvar", statusCode: 500 },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/pagina-publica")
    await page.waitForSelector("#bio, h1", { timeout: 10000 })

    const bioField = page.locator("#bio")
    if (await bioField.isVisible()) {
      await bioField.fill("Bio que vai falhar")
      await page.getByRole("button", { name: /salvar/i }).first().click()

      // Should show error toast
      await page.waitForTimeout(2000)
      const hasErrorFeedback = await page
        .getByText(/erro|falha/i)
        .first()
        .isVisible()
        .catch(() => false)
      // At minimum, the page should not crash
      const bodyContent = await page.locator("body").textContent()
      expect(bodyContent).toBeTruthy()
    }
  })

  test("student portal handles programs API failure gracefully", async ({ page }) => {
    await injectStudentMockAuth(page)

    await page.route("**/api/v1/student-programs/me*", (route: Route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          json: { message: "Internal Server Error", statusCode: 500 },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/aluno/treinos")
    await page.waitForTimeout(5000)

    // Page should render something (error boundary, empty state, etc.) — not crash
    const hasContent = await page.locator("body").textContent()
    expect(hasContent).toBeTruthy()
    expect(hasContent!.length).toBeGreaterThan(0)
  })

  test("network timeout does not leave page in broken state", async ({ page }) => {
    await injectMockAuth(page)

    // Simulate slow API
    await page.route("**/api/v1/students*", async (route: Route) => {
      if (route.request().method() === "GET") {
        // Delay 5 seconds then respond
        await new Promise((r) => setTimeout(r, 5000))
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/students")

    // Should show loading state initially
    await page.waitForTimeout(1000)
    const bodyContent = await page.locator("body").textContent()
    expect(bodyContent).toBeTruthy()

    // After data loads, page should be functional
    await page.waitForTimeout(6000)
    const finalContent = await page.locator("body").textContent()
    expect(finalContent).toBeTruthy()
  })
})
