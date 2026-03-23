/**
 * Profile Editor — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 * Tests cover: load, sections display, form editing, save flow, error handling, logo.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockGetMyProfile,
  mockGetMyProfileStateful,
  mockUpdateProfile,
  mockSaveLpDraft,
  mockPublishLpDraft,
} from "../support/apiMocks"
import { profileEditorFixtures } from "../fixtures/profileEditor.fixtures"

const PAGE_URL = "/pagina-publica"

async function setupPage(
  page: import("@playwright/test").Page,
  fixture: object = profileEditorFixtures.complete
) {
  await injectMockAuth(page)
  await mockGetMyProfile(page, fixture)
  await mockSaveLpDraft(page)
  await mockPublishLpDraft(page)
  await page.goto(PAGE_URL)
  // Wait for the editor to load (spinner disappears, first field appears)
  await page.waitForSelector("#specialties", { timeout: 8000 })
}

// =============================================================================
// Load & Display
// =============================================================================

test.describe("Profile Editor — Load & Display", () => {
  test("renders page heading", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Página Pública" })).toBeVisible()
  })

  test("renders Aparência and Conteúdo da Página sections", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Aparência", { exact: true })).toBeVisible()
    await expect(page.getByText("Conteúdo da Página", { exact: true })).toBeVisible()
  })

  test("renders Salvar aparência button", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("button", { name: "Salvar aparência" })).toBeVisible()
  })

  test("renders visualizar página link", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Visualizar página")).toBeVisible()
  })

  test("visualizar página link points to public slug", async ({ page }) => {
    await setupPage(page)
    const link = page.getByText("Visualizar página")
    const href = await link.getAttribute("href")
    expect(href).toContain(`/coach/${profileEditorFixtures.complete.slug}`)
  })
})

// =============================================================================
// Aparência Section
// =============================================================================

test.describe("Profile Editor — Aparência Section", () => {
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

  test("can edit specialties field", async ({ page }) => {
    await setupPage(page)
    const specialties = page.locator("#specialties")
    await specialties.clear()
    await specialties.fill("Musculação, Pilates")
    await expect(specialties).toHaveValue("Musculação, Pilates")
  })

  test("shows empty specialties for minimal profile", async ({ page }) => {
    await setupPage(page, profileEditorFixtures.minimal)
    await expect(page.locator("#specialties")).toHaveValue("")
  })

  test("shows logo upload field", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Logo")).toBeVisible()
  })

  test("shows logo image when profile has logo", async ({ page }) => {
    await setupPage(page, profileEditorFixtures.withLogo)
    await expect(page.getByAltText("Logo")).toBeVisible()
  })
})

// =============================================================================
// Conteúdo da Página Section
// =============================================================================

test.describe("Profile Editor — Conteúdo da Página Section", () => {
  test("shows lpTitle field with existing value", async ({ page }) => {
    await setupPage(page)
    await expect(page.locator("#lpTitle")).toHaveValue(profileEditorFixtures.complete.lpTitle!)
  })

  test("shows lpSubtitle field with existing value", async ({ page }) => {
    await setupPage(page)
    await expect(page.locator("#lpSubtitle")).toHaveValue(profileEditorFixtures.complete.lpSubtitle!)
  })

  test("shows lpAboutTitle field with existing value", async ({ page }) => {
    await setupPage(page)
    await expect(page.locator("#lpAboutTitle")).toHaveValue(profileEditorFixtures.complete.lpAboutTitle!)
  })

  test("shows lpAboutText field with existing value", async ({ page }) => {
    await setupPage(page)
    await expect(page.locator("#lpAboutText")).toHaveValue(profileEditorFixtures.complete.lpAboutText!)
  })

  test("can edit lpTitle field", async ({ page }) => {
    await setupPage(page)
    const field = page.locator("#lpTitle")
    await field.clear()
    await field.fill("Meu novo título incrível")
    await expect(field).toHaveValue("Meu novo título incrível")
  })

  test("shows Salvar rascunho and Publicar buttons", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("button", { name: "Salvar rascunho" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Publicar" })).toBeVisible()
  })

  test("Publicar button is disabled when no draft exists", async ({ page }) => {
    await setupPage(page, profileEditorFixtures.complete) // lpDraftData: null
    const publishBtn = page.getByRole("button", { name: "Publicar" })
    await expect(publishBtn).toBeDisabled()
  })

  test("shows 'Rascunho pendente' badge when profile has draft", async ({ page }) => {
    await setupPage(page, profileEditorFixtures.withDraft)
    await expect(page.getByText("Rascunho pendente")).toBeVisible()
  })

  test("Publicar button is enabled when profile has draft", async ({ page }) => {
    await setupPage(page, profileEditorFixtures.withDraft)
    const publishBtn = page.getByRole("button", { name: "Publicar" })
    await expect(publishBtn).not.toBeDisabled()
  })

  test("shows template picker with 4 options", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Conversão")).toBeVisible()
    await expect(page.getByText("Autoridade")).toBeVisible()
    await expect(page.getByText("Minimalista")).toBeVisible()
    await expect(page.getByText("Impacto")).toBeVisible()
  })
})

// =============================================================================
// Save Flow — Aparência
// =============================================================================

test.describe("Profile Editor — Save Flow (Aparência)", () => {
  test("Salvar aparência button triggers PUT /profile", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfileStateful(
      page,
      profileEditorFixtures.complete,
      profileEditorFixtures.updated
    )
    await mockUpdateProfile(page, profileEditorFixtures.updated)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)
    await page.goto(PAGE_URL)
    await page.waitForSelector("#specialties", { timeout: 8000 })

    let putCalled = false
    page.on("request", (req) => {
      if (req.method() === "PUT" && req.url().includes("/profile") && !req.url().includes("lp-draft")) {
        putCalled = true
      }
    })

    const salvarBtn = page.getByRole("button", { name: "Salvar aparência" })
    await salvarBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await salvarBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await page.waitForTimeout(500)
    expect(putCalled).toBe(true)
  })

  test("Salvar aparência button shows loading state during submission", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.complete)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)

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
    await page.waitForSelector("#specialties", { timeout: 8000 })

    const salvarBtn = page.getByRole("button", { name: "Salvar aparência" })
    await salvarBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await salvarBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await expect(page.getByText("Salvando...").first()).toBeVisible({ timeout: 3000 })
  })

  test("shows success toast after saving", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.complete)
    await mockUpdateProfile(page, profileEditorFixtures.updated)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)
    await page.goto(PAGE_URL)
    await page.waitForSelector("#specialties", { timeout: 8000 })

    const salvarBtn = page.getByRole("button", { name: "Salvar aparência" })
    await salvarBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await salvarBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await expect(page.getByText("Aparência atualizada com sucesso!")).toBeVisible({ timeout: 5000 })
  })

  test("shows error toast when save fails", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.complete)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)

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
    await page.waitForSelector("#specialties", { timeout: 8000 })

    const salvarBtn = page.getByRole("button", { name: "Salvar aparência" })
    await salvarBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await salvarBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await expect(page.getByText(/Erro ao salvar aparência/i)).toBeVisible({ timeout: 5000 })
  })
})

// =============================================================================
// Save Flow — LP Draft / Publish
// =============================================================================

test.describe("Profile Editor — Save Flow (Conteúdo)", () => {
  test("Salvar rascunho triggers PUT /profile/lp-draft", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.complete)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)
    await page.goto(PAGE_URL)
    await page.waitForSelector("#specialties", { timeout: 8000 })

    let draftPutCalled = false
    page.on("request", (req) => {
      if (req.method() === "PUT" && req.url().includes("/profile/lp-draft")) {
        draftPutCalled = true
      }
    })

    await page.getByRole("button", { name: "Salvar rascunho" }).click()
    await page.waitForTimeout(500)
    expect(draftPutCalled).toBe(true)
  })

  test("shows success toast after saving draft", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfileStateful(page, profileEditorFixtures.complete, profileEditorFixtures.withDraft)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)
    await page.goto(PAGE_URL)
    await page.waitForSelector("#specialties", { timeout: 8000 })

    await page.getByRole("button", { name: "Salvar rascunho" }).click()
    await expect(page.getByText(/Rascunho salvo/i)).toBeVisible({ timeout: 5000 })
  })

  test("Publicar triggers POST /profile/lp/publish", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, profileEditorFixtures.withDraft)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)
    await page.goto(PAGE_URL)
    await page.waitForSelector("#specialties", { timeout: 8000 })

    let publishCalled = false
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().includes("/profile/lp/publish")) {
        publishCalled = true
      }
    })

    const publishBtn = page.getByRole("button", { name: "Publicar" })
    await publishBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await publishBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await page.waitForTimeout(500)
    expect(publishCalled).toBe(true)
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Profile Editor — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("renders both sections on mobile", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Página Pública" })).toBeVisible()
    await expect(page.getByText("Aparência", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Salvar aparência" })).toBeVisible()
  })

  test("content section is reachable by scrolling on mobile", async ({ page }) => {
    await setupPage(page)
    const draftBtn = page.getByRole("button", { name: "Salvar rascunho" })
    await draftBtn.scrollIntoViewIfNeeded()
    await expect(draftBtn).toBeVisible()
  })
})
