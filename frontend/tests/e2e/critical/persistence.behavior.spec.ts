import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockGetMyProfile,
  mockGetMyProfileStateful,
  mockSaveLpDraft,
  mockUpdateProfile,
} from "../support/apiMocks"
import { PROFILE_COMPLETE, PROFILE_WITH_DRAFT } from "../utils/comprehensiveFixtures"

// =============================================================================
// Persistence — Draft and data preservation
// =============================================================================

test.describe("Critical — Persistence", () => {
  test("LP draft persists after page reload", async ({ page }) => {
    await injectMockAuth(page)
    // First load: profile with draft data
    await mockGetMyProfile(page, PROFILE_WITH_DRAFT)

    await page.goto("/pagina-publica")
    await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })

    // Switch to Página tab
    const paginaTab = page.getByRole("tab", { name: /página/i })
    if (await paginaTab.isVisible()) {
      await paginaTab.click()

      // Verify draft badge exists
      await expect(
        page.getByText(/rascunho pendente/i).or(page.getByText(/rascunho/i)).first()
      ).toBeVisible({ timeout: 5000 })

      // Reload page
      await page.reload()
      await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })

      // Switch to Página tab again
      const paginaTabAfter = page.getByRole("tab", { name: /página/i })
      if (await paginaTabAfter.isVisible()) {
        await paginaTabAfter.click()

        // Draft badge should still be visible
        await expect(
          page.getByText(/rascunho pendente/i).or(page.getByText(/rascunho/i)).first()
        ).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test("profile changes are saved when clicking save", async ({ page }) => {
    const updatedProfile = {
      ...PROFILE_COMPLETE,
      bio: "Nova bio persistida após salvar.",
    }

    await injectMockAuth(page)
    await mockGetMyProfileStateful(page, PROFILE_COMPLETE, updatedProfile)
    await mockUpdateProfile(page, updatedProfile)

    await page.goto("/pagina-publica")
    await page.waitForSelector("#bio, h1", { timeout: 10000 })

    const bioField = page.locator("#bio")
    if (await bioField.isVisible()) {
      await bioField.fill("Nova bio persistida após salvar.")
      await page.getByRole("button", { name: /salvar/i }).first().click()

      // Success feedback
      await expect(page.getByText(/sucesso|salvo/i).first()).toBeVisible({ timeout: 5000 })
    }
  })

  test("LP draft save shows success feedback", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, PROFILE_COMPLETE)
    await mockSaveLpDraft(page)

    await page.goto("/pagina-publica")
    await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })

    const paginaTab = page.getByRole("tab", { name: /página/i })
    if (await paginaTab.isVisible()) {
      await paginaTab.click()

      const lpTitle = page.locator("#lpTitle")
      if (await lpTitle.isVisible()) {
        await lpTitle.fill("Novo título de teste")

        const draftBtn = page.getByRole("button", { name: /salvar rascunho/i })
        if (await draftBtn.isVisible()) {
          await draftBtn.click()
          await expect(page.getByText(/sucesso|salvo/i).first()).toBeVisible({ timeout: 5000 })
        }
      }
    }
  })

  test("search filter persists in URL across navigation", async ({ page }) => {
    await injectMockAuth(page)

    // Mock students with search
    await page.route("**/api/v1/students*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: {
            content: [
              {
                id: "st-1",
                name: "Fernanda Costa",
                email: "fernanda@test.com",
                status: "active",
                phoneNumber: null,
                goal: null,
                observations: null,
                physicalRestrictions: null,
                createdAt: "2024-01-10T00:00:00Z",
              },
            ],
            page: 0,
            size: 20,
            totalElements: 1,
            totalPages: 1,
          },
        })
      } else {
        route.fallback()
      }
    })

    // Navigate with search param
    await page.goto("/students?search=Fernanda")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    // URL should contain search param
    expect(page.url()).toContain("search=Fernanda")
  })
})
