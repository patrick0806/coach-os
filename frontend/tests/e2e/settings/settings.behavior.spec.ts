/**
 * Settings Page — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 * Tests cover: profile section (photo, phone), password section, save flow.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockGetMyProfile,
  mockGetMyProfileStateful,
  mockUpdateProfile,
} from "../support/apiMocks"
import { profileEditorFixtures } from "../fixtures/profileEditor.fixtures"

const PAGE_URL = "/settings"

async function setupPage(
  page: import("@playwright/test").Page,
  fixture: object = profileEditorFixtures.complete
) {
  await injectMockAuth(page)
  await mockGetMyProfile(page, fixture)
  await page.goto(PAGE_URL)
  await page.waitForSelector("h1", { timeout: 8000 })
}

// =============================================================================
// Load & Display
// =============================================================================

test.describe("Settings — Load & Display", () => {
  test("renders page heading", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Configuracoes" })).toBeVisible()
  })

  test("renders profile section with heading", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("profile-settings-section")).toBeVisible()
    await expect(page.getByTestId("profile-settings-section").getByText("Perfil", { exact: true })).toBeVisible()
  })

  test("renders password section", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("button", { name: "Alterar senha" })).toBeVisible()
  })

  test("shows phone field with existing value", async ({ page }) => {
    await setupPage(page)
    const phoneInput = page.locator("#settings-phone")
    await expect(phoneInput).toBeVisible()
    await expect(phoneInput).toHaveValue("(11) 98765-4321")
  })

  test("shows empty phone for profile without phone", async ({ page }) => {
    await setupPage(page, profileEditorFixtures.minimal)
    const phoneInput = page.locator("#settings-phone")
    await expect(phoneInput).toHaveValue("")
  })

  test("shows profile photo upload area", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Foto de perfil")).toBeVisible()
  })
})

// =============================================================================
// Edit & Save Flow
// =============================================================================

test.describe("Settings — Save Flow", () => {
  test("Salvar button triggers PUT /profile", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfileStateful(
      page,
      profileEditorFixtures.complete,
      profileEditorFixtures.updated
    )
    await mockUpdateProfile(page, profileEditorFixtures.updated)
    await page.goto(PAGE_URL)
    await page.waitForSelector("h1", { timeout: 8000 })

    let putCalled = false
    page.on("request", (req) => {
      if (req.method() === "PUT" && req.url().includes("/profile") && !req.url().includes("lp-draft")) {
        putCalled = true
      }
    })

    // Find the Salvar button inside the profile section (not password section)
    const salvarBtn = page.locator("[data-tour='profile-settings']").getByRole("button", { name: "Salvar" })
    await salvarBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await salvarBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await page.waitForTimeout(500)
    expect(putCalled).toBe(true)
  })

  test("shows success toast after saving profile", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.complete)
    await mockUpdateProfile(page, profileEditorFixtures.updated)
    await page.goto(PAGE_URL)
    await page.waitForSelector("h1", { timeout: 8000 })

    const salvarBtn = page.locator("[data-tour='profile-settings']").getByRole("button", { name: "Salvar" })
    await salvarBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await salvarBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await expect(page.getByText("Perfil atualizado com sucesso!")).toBeVisible({ timeout: 5000 })
  })

  test("shows error toast when save fails", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.complete)

    await page.route("**/api/v1/profile", (route) => {
      if (route.request().method() === "PUT") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          json: {},
        })
      } else {
        route.fallback()
      }
    })

    await page.goto(PAGE_URL)
    await page.waitForSelector("h1", { timeout: 8000 })

    const salvarBtn = page.locator("[data-tour='profile-settings']").getByRole("button", { name: "Salvar" })
    await salvarBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await salvarBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await expect(page.getByText(/Erro ao salvar perfil/i)).toBeVisible({ timeout: 5000 })
  })

  test("can edit phone field", async ({ page }) => {
    await setupPage(page)
    const phoneInput = page.locator("#settings-phone")
    await phoneInput.clear()
    await phoneInput.fill("11999998888")
    await expect(phoneInput).toHaveValue("(11) 99999-8888")
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Settings — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("renders correctly on mobile", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Configuracoes" })).toBeVisible()
    await expect(page.getByTestId("profile-settings-section")).toBeVisible()
  })
})
