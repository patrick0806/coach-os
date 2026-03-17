/**
 * Training Templates — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 * Builder interactions (add workout, add exercise) are covered in smoke tests
 * since they require navigating to real template IDs.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockProgramTemplatesList,
  mockProgramTemplatesListStateful,
  mockCreateProgramTemplate,
  mockUpdateProgramTemplate,
  mockDeleteProgramTemplate,
  mockDuplicateProgramTemplate,
} from "../support/apiMocks"
import {
  trainingTemplatesFixtures,
  templateItems,
  newTemplateFixture,
} from "../fixtures/trainingTemplates.fixtures"

// --- Setup helpers ---

async function setupPage(page: import("@playwright/test").Page, listFixture: object) {
  await injectMockAuth(page)
  await mockProgramTemplatesList(page, listFixture)
  await page.goto("/training-templates")
  await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
    timeout: 8000,
  })
}

// =============================================================================
// List & Filters
// =============================================================================

test.describe("Training Templates — List & Filters", () => {
  test("shows page heading and create button", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    await expect(page.getByRole("heading", { name: "Programas de Treino" })).toBeVisible()
    await expect(page.getByTestId("create-template-button")).toBeVisible()
  })

  test("shows template cards with names", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    for (const template of templateItems) {
      await expect(page.getByText(template.name)).toBeVisible()
    }
  })

  test("shows empty state when list is empty", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.empty)

    await expect(page.getByText("Nenhum programa encontrado")).toBeVisible()
  })

  test("search input updates URL and shows no-results state", async ({ page }) => {
    await injectMockAuth(page)
    await mockProgramTemplatesList(page, trainingTemplatesFixtures.noResults)
    await page.goto("/training-templates?search=xyznonexistent123")
    await page.waitForSelector("[data-slot='empty-state']", { timeout: 8000 })

    await expect(page.getByText("Nenhum programa encontrado")).toBeVisible()
  })

  test("search input updates URL with debounce", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    await page.getByTestId("template-search").fill("xyznonexistent123")
    await page.waitForURL(/search=xyznonexistent123/, { timeout: 5000 })

    expect(page.url()).toContain("search=xyznonexistent123")
  })

  test("sidebar link navigates to training templates", async ({ page }) => {
    await injectMockAuth(page)
    await mockProgramTemplatesList(page, trainingTemplatesFixtures.withTemplates)
    await page.goto("/dashboard")
    await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })

    await page.getByRole("link", { name: "Treinos" }).click()

    await expect(page).toHaveURL(/training-templates/)
    await expect(page.getByRole("heading", { name: "Programas de Treino" })).toBeVisible()
  })
})

// =============================================================================
// Create Template
// =============================================================================

test.describe("Training Templates — Create", () => {
  test("opens create dialog when clicking create button", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    await page.getByTestId("create-template-button").click()

    await expect(page.getByRole("heading", { name: "Novo programa" })).toBeVisible()
    await expect(page.locator("#template-name")).toBeVisible()
  })

  test("shows validation error when submitting empty form", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    await page.getByTestId("create-template-button").click()
    await expect(page.getByRole("heading", { name: "Novo programa" })).toBeVisible()

    await page.getByTestId("template-submit-button").click()

    await expect(page.getByText("Nome deve ter ao menos 3 caracteres")).toBeVisible()
  })

  test("closes dialog and shows new template after creation", async ({ page }) => {
    await injectMockAuth(page)
    await mockProgramTemplatesListStateful(
      page,
      trainingTemplatesFixtures.withTemplates,
      trainingTemplatesFixtures.afterCreate(newTemplateFixture)
    )
    await mockCreateProgramTemplate(page, newTemplateFixture)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })

    await page.getByTestId("create-template-button").click()
    await expect(page.getByRole("heading", { name: "Novo programa" })).toBeVisible()

    await page.getByTestId("template-name-input").fill(newTemplateFixture.name)
    await page.getByTestId("template-description-input").fill("Descrição de teste")
    await page.getByTestId("template-submit-button").click()

    await expect(page.getByRole("heading", { name: "Novo programa" })).not.toBeVisible()
    await expect(page.getByText(newTemplateFixture.name)).toBeVisible()
  })
})

// =============================================================================
// Edit Template
// =============================================================================

test.describe("Training Templates — Edit", () => {
  test("opens edit dialog for existing template", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    const card = page.getByTestId("template-card").filter({ hasText: templateItems[0].name }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("edit-template").click()

    await expect(page.getByRole("heading", { name: "Editar programa" })).toBeVisible()
  })

  test("closes dialog and shows updated name after editing", async ({ page }) => {
    const updatedTemplate = { ...templateItems[0], name: "Programa Hipertrofia Updated" }

    await injectMockAuth(page)
    await mockProgramTemplatesListStateful(
      page,
      trainingTemplatesFixtures.withTemplates,
      {
        ...trainingTemplatesFixtures.withTemplates,
        content: [updatedTemplate, templateItems[1]],
      }
    )
    await mockUpdateProgramTemplate(page, updatedTemplate)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-testid='template-card']", { timeout: 8000 })

    const card = page.getByTestId("template-card").filter({ hasText: templateItems[0].name }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("edit-template").click()

    await expect(page.getByRole("heading", { name: "Editar programa" })).toBeVisible()
    await page.locator("#template-name").clear()
    await page.locator("#template-name").fill("Programa Hipertrofia Updated")
    await page.getByTestId("template-submit-button").click()

    await expect(page.getByRole("heading", { name: "Editar programa" })).not.toBeVisible()
    await expect(page.getByText("Programa Hipertrofia Updated")).toBeVisible()
  })
})

// =============================================================================
// Duplicate Template
// =============================================================================

test.describe("Training Templates — Duplicate", () => {
  test("shows duplicated template with '(cópia)' suffix", async ({ page }) => {
    const duplicated = {
      ...templateItems[0],
      id: "tpl-copy",
      name: `${templateItems[0].name} (cópia)`,
    }

    await injectMockAuth(page)
    await mockProgramTemplatesListStateful(
      page,
      trainingTemplatesFixtures.withTemplates,
      trainingTemplatesFixtures.afterCreate(duplicated)
    )
    await mockDuplicateProgramTemplate(page, duplicated)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-testid='template-card']", { timeout: 8000 })

    const card = page.getByTestId("template-card").filter({ hasText: templateItems[0].name }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("duplicate-template").click()

    await expect(page.getByText(`${templateItems[0].name} (cópia)`)).toBeVisible()
  })
})

// =============================================================================
// Delete Template
// =============================================================================

test.describe("Training Templates — Delete", () => {
  test("shows confirmation dialog when clicking delete", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    const card = page.getByTestId("template-card").filter({ hasText: templateItems[0].name }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("delete-template").click()

    await expect(page.getByRole("heading", { name: "Excluir programa" })).toBeVisible()
  })

  test("removes template from list after confirming delete", async ({ page }) => {
    await injectMockAuth(page)
    await mockProgramTemplatesListStateful(
      page,
      trainingTemplatesFixtures.withTemplates,
      trainingTemplatesFixtures.afterDelete
    )
    await mockDeleteProgramTemplate(page)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-testid='template-card']", { timeout: 8000 })

    await expect(page.getByText(templateItems[0].name)).toBeVisible()

    const card = page.getByTestId("template-card").filter({ hasText: templateItems[0].name }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("delete-template").click()

    await expect(page.getByRole("heading", { name: "Excluir programa" })).toBeVisible()
    await page.getByTestId("confirm-delete-template").click()

    await expect(page.getByText(templateItems[0].name)).not.toBeVisible()
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Training Templates — Mobile", () => {
  test.use({ viewport: { width: 412, height: 915 } })

  test("shows page heading on mobile", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    await expect(page.getByRole("heading", { name: "Programas de Treino" })).toBeVisible()
  })

  test("search updates URL on mobile", async ({ page }) => {
    await setupPage(page, trainingTemplatesFixtures.withTemplates)

    await page.getByTestId("template-search").fill("xyznonexistent")
    await page.waitForURL(/search=xyznonexistent/, { timeout: 5000 })

    expect(page.url()).toContain("search=xyznonexistent")
  })
})
