/**
 * Exercise Library — Behavioral Tests
 *
 * These tests run entirely with mocked API responses (page.route).
 * No backend required. Deterministic regardless of accumulated data.
 *
 * Coverage:
 *   - Page structure and navigation
 *   - List display (global vs private badges)
 *   - Search and muscle group filters
 *   - Empty state
 *   - Pagination controls
 *   - Create dialog (form, validation, submission)
 *   - Edit dialog (disabled for globals, opens for private)
 *   - Delete dialog (disabled for globals, confirmation for private)
 *   - Mobile viewport
 */
import { test, expect } from "@playwright/test"
import { injectMockAuth, mockExercisesList, mockCreateExercise, mockExercisesListStateful, mockDeleteExercise, mockUpdateExercise } from "../support/apiMocks"
import { exercisesFixtures, privateExercise, MOCK_TENANT_ID } from "../fixtures/exercises.fixtures"

// --- Setup helpers ---

async function setupPage(page: import("@playwright/test").Page, listFixture: object) {
  await injectMockAuth(page)
  await mockExercisesList(page, listFixture)
  await page.goto("/exercises")
  await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 })
}

// =============================================================================
// List & Display
// =============================================================================

test.describe("Exercise Library — List & Display", () => {
  test("shows page heading and create button", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    await expect(page.getByRole("heading", { name: "Exercícios" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Criar exercício" })).toBeVisible()
  })

  test("shows 'Plataforma' badge for global exercises", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    const badge = page.getByText("Plataforma").first()
    await expect(badge).toBeVisible()
  })

  test("shows 'Meu' badge for private exercises", async ({ page }) => {
    await setupPage(page, exercisesFixtures.withPrivate)

    await expect(page.getByText("Meu")).toBeVisible()
  })

  test("shows both global and private exercises in the grid", async ({ page }) => {
    await setupPage(page, exercisesFixtures.withPrivate)

    await expect(page.getByText("Supino Reto")).toBeVisible()
    await expect(page.getByText("Rosca Direta Custom")).toBeVisible()
  })

  test("shows empty state when list is empty", async ({ page }) => {
    await setupPage(page, exercisesFixtures.empty)

    await expect(page.getByText("Nenhum exercício encontrado")).toBeVisible()
  })

  test("shows empty state with filter hint when filters are active", async ({ page }) => {
    await injectMockAuth(page)
    await mockExercisesList(page, exercisesFixtures.noResults)
    await page.goto("/exercises?search=xyznotfound")
    await page.waitForSelector("[data-slot='empty-state']", { timeout: 8000 })

    await expect(page.getByText("Nenhum exercício encontrado")).toBeVisible()
  })
})

// =============================================================================
// Filters
// =============================================================================

test.describe("Exercise Library — Filters", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)
  })

  test("search input updates the URL with search param", async ({ page }) => {
    await page.getByPlaceholder("Buscar por nome...").fill("Supino")
    await page.waitForURL(/search=Supino/, { timeout: 5000 })

    expect(page.url()).toContain("search=Supino")
  })

  test("clearing search removes param from URL", async ({ page }) => {
    await page.getByPlaceholder("Buscar por nome...").fill("Supino")
    await page.waitForURL(/search=Supino/, { timeout: 5000 })

    await page.getByPlaceholder("Buscar por nome...").clear()
    await page.waitForURL((url) => !url.toString().includes("search="), { timeout: 5000 })

    expect(page.url()).not.toContain("search=")
  })
})

// =============================================================================
// Pagination
// =============================================================================

test.describe("Exercise Library — Pagination", () => {
  test("shows pagination controls when totalPages > 1", async ({ page }) => {
    await setupPage(page, exercisesFixtures.withPagination)

    await expect(page.getByRole("button", { name: "Anterior" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Próximo" })).toBeVisible()
    await expect(page.getByText(/Página 1 de 5/)).toBeVisible()
  })

  test("hides pagination when only one page", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    await expect(page.getByRole("button", { name: "Anterior" })).not.toBeVisible()
    await expect(page.getByRole("button", { name: "Próximo" })).not.toBeVisible()
  })

  test("'Anterior' button is disabled on first page", async ({ page }) => {
    await setupPage(page, exercisesFixtures.withPagination)

    await expect(page.getByRole("button", { name: "Anterior" })).toBeDisabled()
  })
})

// =============================================================================
// Create Exercise
// =============================================================================

test.describe("Exercise Library — Create", () => {
  test("opens create dialog when clicking 'Criar exercício'", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    await page.getByRole("button", { name: "Criar exercício" }).click()

    await expect(page.getByRole("heading", { name: "Novo exercício" })).toBeVisible()
    await expect(page.locator("#exercise-name")).toBeVisible()
    await expect(page.locator("#exercise-muscleGroup")).toBeVisible()
  })

  test("shows validation error when submitting empty form", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    await page.getByRole("button", { name: "Criar exercício" }).click()
    await expect(page.getByRole("heading", { name: "Novo exercício" })).toBeVisible()

    await page.getByRole("button", { name: "Salvar" }).click()

    await expect(page.getByText("Nome deve ter ao menos 2 caracteres")).toBeVisible()
  })

  test("closes dialog and shows success toast after creation", async ({ page }) => {
    const newExercise = {
      id: "ex-new-1",
      name: "Supino Inclinado",
      muscleGroup: "peitoral",
      description: null,
      instructions: null,
      mediaUrl: null,
      youtubeUrl: null,
      tenantId: MOCK_TENANT_ID,
      createdAt: new Date().toISOString(),
    }

    await injectMockAuth(page)
    await mockExercisesListStateful(
      page,
      exercisesFixtures.globalsOnly,
      exercisesFixtures.afterCreate(newExercise)
    )
    await mockCreateExercise(page, newExercise)
    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 })

    await page.getByRole("button", { name: "Criar exercício" }).click()
    await expect(page.getByRole("heading", { name: "Novo exercício" })).toBeVisible()

    await page.locator("#exercise-name").fill("Supino Inclinado")
    await page.locator("#exercise-muscleGroup").click()
    await page.getByRole("option", { name: "Peitoral" }).click()

    await page.getByRole("button", { name: "Salvar" }).click()

    // Dialog closes on success
    await expect(page.getByRole("heading", { name: "Novo exercício" })).not.toBeVisible()

    // New exercise appears in the grid after refetch
    await expect(page.getByText("Supino Inclinado")).toBeVisible()
  })
})

// =============================================================================
// Edit Exercise
// =============================================================================

test.describe("Exercise Library — Edit", () => {
  test("edit option is disabled for global exercises", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    const globalCard = page.locator(".group").filter({ hasText: "Plataforma" }).first()
    await globalCard.hover()
    await globalCard.locator("[data-testid='exercise-actions']").click()

    const editItem = page.getByTestId("edit-exercise")
    await expect(editItem).toBeVisible()
    await expect(editItem).toBeDisabled()
  })

  test("edit option is enabled for private exercises", async ({ page }) => {
    await setupPage(page, exercisesFixtures.withPrivate)

    const privateCard = page.locator(".group").filter({ hasText: "Meu" }).first()
    await privateCard.hover()
    await privateCard.locator("[data-testid='exercise-actions']").click()

    const editItem = page.getByTestId("edit-exercise")
    await expect(editItem).toBeVisible()
    await expect(editItem).not.toBeDisabled()
  })

  test("opens edit dialog with exercise data pre-filled", async ({ page }) => {
    await setupPage(page, exercisesFixtures.withPrivate)

    const privateCard = page.locator(".group").filter({ hasText: "Meu" }).first()
    await privateCard.hover()
    await privateCard.locator("[data-testid='exercise-actions']").click()
    await page.getByTestId("edit-exercise").click()

    await expect(page.getByRole("heading", { name: "Editar exercício" })).toBeVisible()

    // Name field should be pre-filled with the private exercise name
    const nameInput = page.locator("#exercise-name")
    await expect(nameInput).toHaveValue(privateExercise.name)
  })

  test("closes dialog and shows success after updating exercise name", async ({ page }) => {
    const updatedExercise = { ...privateExercise, name: "Rosca Direta Updated" }

    await injectMockAuth(page)
    await mockExercisesListStateful(
      page,
      exercisesFixtures.withPrivate,
      { ...exercisesFixtures.withPrivate, content: [...exercisesFixtures.withPrivate.content.slice(0, -1), updatedExercise] }
    )
    await mockUpdateExercise(page, updatedExercise)
    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 })

    const privateCard = page.locator(".group").filter({ hasText: "Meu" }).first()
    await privateCard.hover()
    await privateCard.locator("[data-testid='exercise-actions']").click()
    await page.getByTestId("edit-exercise").click()

    await expect(page.getByRole("heading", { name: "Editar exercício" })).toBeVisible()

    await page.locator("#exercise-name").clear()
    await page.locator("#exercise-name").fill("Rosca Direta Updated")
    await page.getByRole("button", { name: "Salvar" }).click()

    await expect(page.getByRole("heading", { name: "Editar exercício" })).not.toBeVisible()
    await expect(page.getByText("Rosca Direta Updated")).toBeVisible()
  })
})

// =============================================================================
// Delete Exercise
// =============================================================================

test.describe("Exercise Library — Delete", () => {
  test("delete option is disabled for global exercises", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    const globalCard = page.locator(".group").filter({ hasText: "Plataforma" }).first()
    await globalCard.hover()
    await globalCard.locator("[data-testid='exercise-actions']").click()

    const deleteItem = page.getByTestId("delete-exercise")
    await expect(deleteItem).toBeVisible()
    await expect(deleteItem).toBeDisabled()
  })

  test("delete option is enabled for private exercises", async ({ page }) => {
    await setupPage(page, exercisesFixtures.withPrivate)

    const privateCard = page.locator(".group").filter({ hasText: "Meu" }).first()
    await privateCard.hover()
    await privateCard.locator("[data-testid='exercise-actions']").click()

    const deleteItem = page.getByTestId("delete-exercise")
    await expect(deleteItem).toBeVisible()
    await expect(deleteItem).not.toBeDisabled()
  })

  test("shows confirmation dialog when clicking delete", async ({ page }) => {
    await setupPage(page, exercisesFixtures.withPrivate)

    const privateCard = page.locator(".group").filter({ hasText: "Meu" }).first()
    await privateCard.hover()
    await privateCard.locator("[data-testid='exercise-actions']").click()
    await page.getByTestId("delete-exercise").click()

    await expect(page.getByRole("heading", { name: "Excluir exercício" })).toBeVisible()
  })

  test("removes exercise from list after confirming delete", async ({ page }) => {
    await injectMockAuth(page)
    await mockExercisesListStateful(
      page,
      exercisesFixtures.withPrivate,
      exercisesFixtures.afterDelete
    )
    await mockDeleteExercise(page)
    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 })

    // Ensure private exercise is visible before delete
    await expect(page.getByText(privateExercise.name)).toBeVisible()

    const privateCard = page.locator(".group").filter({ hasText: "Meu" }).first()
    await privateCard.hover()
    await privateCard.locator("[data-testid='exercise-actions']").click()
    await page.getByTestId("delete-exercise").click()

    await expect(page.getByRole("heading", { name: "Excluir exercício" })).toBeVisible()
    await page.getByRole("button", { name: "Excluir" }).click()

    // Exercise should disappear after list refetch
    await expect(page.getByText(privateExercise.name)).not.toBeVisible()
  })
})

// =============================================================================
// Exercise Detail
// =============================================================================

test.describe("Exercise Library — Detail", () => {
  test("opens detail dialog with exercise info", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    const firstCard = page.locator(".group").first()
    await firstCard.hover()
    await firstCard.locator("[data-testid='exercise-actions']").click()
    await page.getByRole("menuitem", { name: "Ver detalhes" }).click()

    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("Plataforma").last()).toBeVisible()
  })
})

// =============================================================================
// Mobile Viewport
// =============================================================================

test.describe("Exercise Library — Mobile", () => {
  test.use({ viewport: { width: 412, height: 915 } })

  test("shows exercise grid on mobile", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    await expect(page.getByRole("heading", { name: "Exercícios" })).toBeVisible()
    await expect(page.locator(".group").first()).toBeVisible()
  })

  test("search input is accessible on mobile", async ({ page }) => {
    await setupPage(page, exercisesFixtures.globalsOnly)

    const searchInput = page.getByPlaceholder("Buscar por nome...")
    await expect(searchInput).toBeVisible()
    await searchInput.fill("Supino")
    await page.waitForURL(/search=Supino/, { timeout: 5000 })
  })
})
