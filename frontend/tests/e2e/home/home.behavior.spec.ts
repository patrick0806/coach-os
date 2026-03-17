/**
 * Home Page — Behavioral Tests
 *
 * Tests static UI elements of the landing page.
 * Plans section is fetched server-side (publicServerFetch) and cannot be
 * intercepted by page.route() — that scenario lives in home.smoke.spec.ts.
 */
import { test, expect } from "@playwright/test"

test.describe("Home Page — Static Content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("renders hero section with CTA buttons", async ({ page }) => {
    await expect(
      page.getByText("Plataforma completa para Personal Trainers", { exact: true })
    ).toBeVisible()

    await expect(
      page.getByRole("link", { name: "Começar 30 dias grátis" })
    ).toBeVisible()

    await expect(
      page.getByRole("link", { name: /Ver planos/i })
    ).toBeVisible()
  })

  test("shows stats bar", async ({ page }) => {
    await expect(page.getByText(/500\+/)).toBeVisible()
    await expect(page.getByText(/10k\+/)).toBeVisible()
    await expect(page.getByText(/98%/)).toBeVisible()
  })

  test("renders feature blocks", async ({ page }) => {
    const featureBlocks = page.locator("section").filter({
      hasText: /treino|agenda|aluno/i,
    })
    expect(await featureBlocks.count()).toBeGreaterThan(0)
  })

  test("shows 'Como funciona' section with 3 steps", async ({ page }) => {
    const section = page.locator("#como-funciona")
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await expect(section.getByRole("heading", { name: "Simples de começar" })).toBeVisible()

    await expect(page.getByText("01", { exact: true })).toBeVisible()
    await expect(page.getByText("02", { exact: true })).toBeVisible()
    await expect(page.getByText("03", { exact: true })).toBeVisible()

    await expect(page.getByText(/Cadastre/i).first()).toBeVisible()
    await expect(page.getByText(/Configure/i).first()).toBeVisible()
    await expect(page.getByText(/Gerencie/i).first()).toBeVisible()
  })
})

test.describe("Home Page — Navbar Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test("hamburger menu opens sheet with navigation links", async ({ page }) => {
    await page.goto("/")

    const menuButton = page.locator('[data-slot="navbar"] button').first()
    await menuButton.click()

    await expect(page.getByRole("link", { name: "Entrar" }).last()).toBeVisible()
  })
})
