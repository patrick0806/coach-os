/**
 * Profile Editor — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 * Tests cover: load, tab switching, form editing, save flow, error handling.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockGetMyProfile,
  mockGetMyProfileStateful,
  mockUpdateProfile,
} from "../support/apiMocks"
import { profileEditorFixtures } from "../fixtures/profileEditor.fixtures"

const PAGE_URL = "/pagina-publica"

async function setupPage(
  page: import("@playwright/test").Page,
  fixture: object = profileEditorFixtures.complete
) {
  await injectMockAuth(page)
  await mockGetMyProfile(page, fixture)
  await page.goto(PAGE_URL)
  // Wait for the editor to load (spinner disappears, tabs appear)
  await page.waitForSelector("[role='tablist']", { timeout: 8000 })
}

// =============================================================================
// Load & Display
// =============================================================================

test.describe("Profile Editor — Load & Display", () => {
  test("renders page heading", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Página Pública" })).toBeVisible()
  })

  test("renders two tabs: Perfil and Página", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("tab", { name: "Perfil" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Página" })).toBeVisible()
  })

  test("renders save button", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible()
  })

  test("renders visualizar página link", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Visualizar página")).toBeVisible()
  })

  test("visualizar página link points to public slug", async ({ page }) => {
    await setupPage(page)
    const link = page.getByText("Visualizar página")
    const href = await link.getAttribute("href")
    expect(href).toContain(`/personais/${profileEditorFixtures.complete.slug}`)
  })
})

// =============================================================================
// Perfil Tab
// =============================================================================

test.describe("Profile Editor — Perfil Tab", () => {
  test("shows bio field with existing value", async ({ page }) => {
    await setupPage(page)
    const bio = page.locator("#bio")
    await expect(bio).toBeVisible()
    await expect(bio).toHaveValue(profileEditorFixtures.complete.bio!)
  })

  test("shows phone number field with existing value", async ({ page }) => {
    await setupPage(page)
    const phone = page.locator("#phoneNumber")
    await expect(phone).toBeVisible()
    await expect(phone).toHaveValue(profileEditorFixtures.complete.phoneNumber!)
  })

  test("shows specialties field with existing value", async ({ page }) => {
    await setupPage(page)
    const specialties = page.locator("#specialties")
    await expect(specialties).toBeVisible()
    await expect(specialties).toHaveValue("Funcional, Musculação")
  })

  test("shows theme color field", async ({ page }) => {
    await setupPage(page)
    await expect(page.locator("#themeColor").last()).toBeVisible()
  })

  test("can edit bio field", async ({ page }) => {
    await setupPage(page)
    const bio = page.locator("#bio")
    await bio.clear()
    await bio.fill("Nova bio do treinador")
    await expect(bio).toHaveValue("Nova bio do treinador")
  })

  test("can edit phone number field", async ({ page }) => {
    await setupPage(page)
    const phone = page.locator("#phoneNumber")
    await phone.clear()
    await phone.fill("11999990000")
    // Formatted by mask
    const value = await phone.inputValue()
    expect(value).toContain("11")
  })

  test("can edit specialties field", async ({ page }) => {
    await setupPage(page)
    const specialties = page.locator("#specialties")
    await specialties.clear()
    await specialties.fill("Musculação, Pilates")
    await expect(specialties).toHaveValue("Musculação, Pilates")
  })

  test("shows empty fields for minimal profile", async ({ page }) => {
    await setupPage(page, profileEditorFixtures.minimal)
    await expect(page.locator("#bio")).toHaveValue("")
    await expect(page.locator("#phoneNumber")).toHaveValue("")
    await expect(page.locator("#specialties")).toHaveValue("")
  })
})

// =============================================================================
// Página Tab
// =============================================================================

test.describe("Profile Editor — Página Tab", () => {
  test("switches to Página tab", async ({ page }) => {
    await setupPage(page)
    await page.getByRole("tab", { name: "Página" }).click()
    await expect(page.locator("#lpTitle")).toBeVisible()
  })

  test("shows lpTitle field with existing value", async ({ page }) => {
    await setupPage(page)
    await page.getByRole("tab", { name: "Página" }).click()
    await expect(page.locator("#lpTitle")).toHaveValue(profileEditorFixtures.complete.lpTitle!)
  })

  test("shows lpSubtitle field with existing value", async ({ page }) => {
    await setupPage(page)
    await page.getByRole("tab", { name: "Página" }).click()
    await expect(page.locator("#lpSubtitle")).toHaveValue(profileEditorFixtures.complete.lpSubtitle!)
  })

  test("shows lpAboutTitle field with existing value", async ({ page }) => {
    await setupPage(page)
    await page.getByRole("tab", { name: "Página" }).click()
    await expect(page.locator("#lpAboutTitle")).toHaveValue(profileEditorFixtures.complete.lpAboutTitle!)
  })

  test("shows lpAboutText field with existing value", async ({ page }) => {
    await setupPage(page)
    await page.getByRole("tab", { name: "Página" }).click()
    await expect(page.locator("#lpAboutText")).toHaveValue(profileEditorFixtures.complete.lpAboutText!)
  })

  test("can edit lpTitle field", async ({ page }) => {
    await setupPage(page)
    await page.getByRole("tab", { name: "Página" }).click()
    const field = page.locator("#lpTitle")
    await field.clear()
    await field.fill("Meu novo título incrível")
    await expect(field).toHaveValue("Meu novo título incrível")
  })

  test("editing fields in Perfil tab persists when switching to Página tab", async ({ page }) => {
    await setupPage(page)

    // Edit bio in Perfil tab
    await page.locator("#bio").clear()
    await page.locator("#bio").fill("Bio editada")

    // Switch to Página
    await page.getByRole("tab", { name: "Página" }).click()
    await expect(page.locator("#lpTitle")).toBeVisible()

    // Switch back to Perfil
    await page.getByRole("tab", { name: "Perfil" }).click()
    await expect(page.locator("#bio")).toHaveValue("Bio editada")
  })
})

// =============================================================================
// Save Flow
// =============================================================================

test.describe("Profile Editor — Save Flow", () => {
  test("save button triggers PUT /profile", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfileStateful(
      page,
      profileEditorFixtures.complete,
      profileEditorFixtures.updated
    )
    await mockUpdateProfile(page, profileEditorFixtures.updated)
    await page.goto(PAGE_URL)
    await page.waitForSelector("[role='tablist']", { timeout: 8000 })

    let putCalled = false
    page.on("request", (req) => {
      if (req.method() === "PUT" && req.url().includes("/profile")) {
        putCalled = true
      }
    })

    await page.getByRole("button", { name: "Salvar" }).click()
    await page.waitForTimeout(500)
    expect(putCalled).toBe(true)
  })

  test("save button shows loading state during submission", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.complete)

    // Slow PUT response to observe loading state
    await page.route("**/api/v1/profile", async (route) => {
      if (route.request().method() === "PUT") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        await route.fulfill({ status: 200, contentType: "application/json", json: profileEditorFixtures.updated })
      } else {
        await route.fallback()
      }
    })

    await page.goto(PAGE_URL)
    await page.waitForSelector("[role='tablist']", { timeout: 8000 })

    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByText("Salvando...")).toBeVisible()
  })

  test("shows success toast after saving", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.complete)
    await mockUpdateProfile(page, profileEditorFixtures.updated)
    await page.goto(PAGE_URL)
    await page.waitForSelector("[role='tablist']", { timeout: 8000 })

    await page.getByRole("button", { name: "Salvar" }).click()
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
          json: { message: "Erro interno do servidor" },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto(PAGE_URL)
    await page.waitForSelector("[role='tablist']", { timeout: 8000 })

    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByText(/Erro ao salvar perfil/i)).toBeVisible({ timeout: 5000 })
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Profile Editor — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("renders correctly on mobile", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Página Pública" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Perfil" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible()
  })

  test("tabs work on mobile", async ({ page }) => {
    await setupPage(page)
    await page.getByRole("tab", { name: "Página" }).click()
    await expect(page.locator("#lpTitle")).toBeVisible()
  })
})
