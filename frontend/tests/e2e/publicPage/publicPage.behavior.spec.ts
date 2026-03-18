/**
 * Public Page — Behavioral Tests
 *
 * NOTE: The main public page at /personais/[slug] is a Next.js Server Component
 * that fetches data via publicServerFetch() (Node.js server-side).
 * Playwright page.route() cannot intercept server-side fetches.
 *
 * Coverage in this file:
 * - Error/fallback states when backend is unavailable (testable without backend)
 * - Navigation and routing behavior
 *
 * Happy path rendering (coach profile, plans, availability) is covered in smoke tests.
 */
import { test, expect } from "@playwright/test"

const TEST_SLUG = "test-slug-behavior"

// =============================================================================
// Public Page — Not Found
// =============================================================================

test.describe("Public Page — Not Found Behavior", () => {
  test("shows 404 when slug does not exist (no backend)", async ({ page }) => {
    // Without backend, publicServerFetch returns null → notFound()
    const response = await page.goto(`/personais/${TEST_SLUG}`)
    // Next.js renders 404 or the error page
    expect(response?.status()).toBe(404)
  })
})

// =============================================================================
// Student Auth Sub-Pages — Not Found Fallback
// =============================================================================

test.describe("Public Page — Student Auth Fallback", () => {
  test("login page shows coach not found fallback without backend", async ({ page }) => {
    await page.goto(`/personais/${TEST_SLUG}/login`)
    await expect(page.getByText("Treinador não encontrado")).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/link.*inválido|expirou/i)).toBeVisible()
  })

  test("esqueci-senha page shows coach not found fallback without backend", async ({ page }) => {
    await page.goto(`/personais/${TEST_SLUG}/esqueci-senha`)
    await expect(page.getByText("Treinador não encontrado")).toBeVisible({ timeout: 8000 })
  })

  test("configurar-senha page shows coach not found fallback without backend", async ({ page }) => {
    await page.goto(`/personais/${TEST_SLUG}/configurar-senha`)
    await expect(page.getByText("Treinador não encontrado")).toBeVisible({ timeout: 8000 })
  })

  test("redefinir-senha page shows coach not found fallback without backend", async ({ page }) => {
    await page.goto(`/personais/${TEST_SLUG}/redefinir-senha`)
    await expect(page.getByText("Treinador não encontrado")).toBeVisible({ timeout: 8000 })
  })
})
