/**
 * Auth — Behavioral Tests
 *
 * Covers client-side UX behaviors: form validation, stepper navigation,
 * password strength, back links, and mocked auth flow responses.
 * No real backend required.
 */
import { test, expect } from "@playwright/test"
import {
  mockPlansList,
  mockAuthLoginFail,
  mockPasswordResetRequest,
  injectMockAuth,
} from "../support/apiMocks"
import { plansFixtures } from "../fixtures/plans.fixtures"

// =============================================================================
// Back link — pure UI, no API
// =============================================================================

test.describe("Auth — Navigation Links", () => {
  test("back to home link exists on all auth pages", async ({ page }) => {
    for (const path of ["/login", "/cadastro", "/esqueci-senha"]) {
      await page.goto(path)
      const backLink = page.getByRole("link", { name: /Início/i })
      await expect(backLink).toBeVisible()
      expect(await backLink.getAttribute("href")).toBe("/")
    }
  })
})

// =============================================================================
// Login form — mocked API responses
// =============================================================================

test.describe("Auth — Login Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
  })

  test("shows email and password fields with submit button", async ({ page }) => {
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
  })

  test("stays on login page when credentials are rejected", async ({ page }) => {
    await mockAuthLoginFail(page)

    await page.locator("#email").fill("wrong@test.com")
    await page.locator("#password").fill("WrongPass1")
    await page.getByRole("button", { name: "Entrar" }).click()

    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/login/)
  })
})

// =============================================================================
// Register form — plan stepper UX
// =============================================================================

test.describe("Auth — Register Stepper", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlansList(page, plansFixtures)
    await page.goto("/cadastro")

    // Wait for plan buttons to load
    const planButton = page.locator("button").filter({ hasText: /alunos/ })
    await planButton.first().waitFor({ timeout: 10000 })
  })

  test("plan selection step shows available plans", async ({ page }) => {
    const planButton = page.locator("button").filter({ hasText: /alunos/ })
    expect(await planButton.count()).toBeGreaterThanOrEqual(1)
  })

  test("continuing after plan selection shows registration form", async ({ page }) => {
    await page.locator("button").filter({ hasText: /alunos/ }).first().click()
    await page.getByRole("button", { name: "Continuar" }).click()

    await expect(page.locator("#name")).toBeVisible()
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
    await expect(page.locator("#confirmPassword")).toBeVisible()
  })

  test("preselected plan shows badge with price on step 2", async ({ page }) => {
    await page.locator("button").filter({ hasText: /alunos/ }).first().click()
    await page.getByRole("button", { name: "Continuar" }).click()

    const planBanner = page.locator(".border-primary\\/30")
    await expect(planBanner).toBeVisible()
    await expect(planBanner.getByText(/R\$/)).toBeVisible()
  })

  test("back to plan selection button returns to step 1", async ({ page }) => {
    await page.locator("button").filter({ hasText: /alunos/ }).first().click()
    await page.getByRole("button", { name: "Continuar" }).click()

    await expect(page.locator("#name")).toBeVisible()

    await page.getByRole("button", { name: /Escolher outro plano/i }).click()

    await expect(page.getByText("Escolha seu plano")).toBeVisible()
  })

  test("password strength indicator changes with input", async ({ page }) => {
    await page.locator("button").filter({ hasText: /alunos/ }).first().click()
    await page.getByRole("button", { name: "Continuar" }).click()

    const passwordInput = page.locator("#password")

    await passwordInput.fill("abcdefgh")
    await expect(page.getByText("Fraca")).toBeVisible()

    await passwordInput.fill("Abcdefgh")
    await expect(page.getByText("Média")).toBeVisible()

    await passwordInput.fill("Abcdefg1")
    await expect(page.getByText("Forte")).toBeVisible()
  })
})

// =============================================================================
// Forgot password — mocked API
// =============================================================================

test.describe("Auth — Forgot Password", () => {
  test("shows success message after submitting any email (anti-enumeration)", async ({ page }) => {
    await mockPasswordResetRequest(page)
    await page.goto("/esqueci-senha")

    await page.locator("#email").fill("any-email@test.com")
    await page.getByRole("button", { name: "Enviar instruções" }).click()

    await expect(page.getByText("Verifique seu e-mail")).toBeVisible({ timeout: 10000 })
  })
})

// =============================================================================
// Auth guard — redirect behavior
// =============================================================================

test.describe("Auth — Route Guard", () => {
  test("authenticated user is redirected away from /login", async ({ page }) => {
    await injectMockAuth(page)
    await page.goto("/login")

    // Proxy redirects authenticated users from auth pages to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
  })

  test("unauthenticated user cannot access dashboard", async ({ page }) => {
    // No cookies injected — no session
    await page.goto("/dashboard")

    // Edge proxy redirects to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
