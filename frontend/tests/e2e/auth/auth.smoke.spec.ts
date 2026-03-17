/**
 * Auth — Smoke Tests @smoke
 *
 * Full register → login flow against the real backend.
 * Run with: npx playwright test --project=smoke
 */
import { test, expect } from "@playwright/test"
import { generateUniqueEmail, TEST_PASSWORD, TEST_USER } from "../helpers"

test.describe("Auth Flow @smoke", () => {
  test.describe.configure({ mode: "serial" })

  let registeredEmail: string

  test("register successfully redirects to dashboard", async ({ page }) => {
    registeredEmail = generateUniqueEmail()

    await page.goto("/cadastro")

    const planButton = page.locator("button").filter({ hasText: /alunos/ })
    await planButton.first().waitFor({ timeout: 15000 })
    await planButton.first().click()
    await page.getByRole("button", { name: "Continuar" }).click()

    await page.locator("#name").fill(TEST_USER.name)
    await page.locator("#email").fill(registeredEmail)
    await page.locator("#password").fill(TEST_PASSWORD)
    await page.locator("#confirmPassword").fill(TEST_PASSWORD)

    await page.getByRole("button", { name: "Criar conta" }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    const errorToast = page.locator('[data-type="error"]')
    await expect(errorToast).toHaveCount(0)
  })

  test("login with registered credentials redirects to dashboard", async ({ page }) => {
    if (!registeredEmail) test.skip()

    await page.goto("/login")

    await page.locator("#email").fill(registeredEmail)
    await page.locator("#password").fill(TEST_PASSWORD)

    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    const errorToast = page.locator('[data-type="error"]')
    await expect(errorToast).toHaveCount(0)
  })

  test("register with duplicate email shows error toast", async ({ page }) => {
    if (!registeredEmail) test.skip()

    await page.goto("/cadastro")

    const planButton = page.locator("button").filter({ hasText: /alunos/ })
    await planButton.first().waitFor({ timeout: 15000 })
    await planButton.first().click()
    await page.getByRole("button", { name: "Continuar" }).click()

    await page.locator("#name").fill(TEST_USER.name)
    await page.locator("#email").fill(registeredEmail)
    await page.locator("#password").fill(TEST_PASSWORD)
    await page.locator("#confirmPassword").fill(TEST_PASSWORD)

    await page.getByRole("button", { name: "Criar conta" }).click()

    const errorToast = page.locator('[data-type="error"]')
    await expect(errorToast).toBeVisible({ timeout: 10000 })
  })
})
