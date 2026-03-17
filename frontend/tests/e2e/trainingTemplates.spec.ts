import { test, expect } from "@playwright/test"
import { loginAsDemoCoach, generateUniqueName } from "./helpers"

test.describe("Training Templates — List & Filters", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })
  })

  test("navigates to training templates page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Programas de Treino" })).toBeVisible()
    await expect(page.getByTestId("create-template-button")).toBeVisible()
  })

  test("search filters templates", async ({ page }) => {
    await page.getByTestId("template-search").fill("xyznonexistent123")
    await page.waitForURL(/search=xyznonexistent123/, { timeout: 5000 })
    await expect(page.getByText("Nenhum programa encontrado")).toBeVisible()
  })

  test("shows empty state when no results", async ({ page }) => {
    await page.getByTestId("template-search").fill("xyznonexistenttemplate999")
    await page.waitForURL(/search=xyznonexistenttemplate999/, { timeout: 5000 })
    await expect(page.getByText("Nenhum programa encontrado")).toBeVisible()
  })

  test("sidebar link navigates to training templates", async ({ page }) => {
    await page.goto("/dashboard")
    await page.getByRole("link", { name: "Treinos" }).click()
    await expect(page).toHaveURL(/training-templates/)
    await expect(page.getByRole("heading", { name: "Programas de Treino" })).toBeVisible()
  })
})

test.describe("Create Program Template", () => {
  test.describe.configure({ mode: "serial" })

  let createdTemplateName: string

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })
  })

  test("opens create dialog", async ({ page }) => {
    await page.getByTestId("create-template-button").click()
    await expect(page.getByRole("heading", { name: "Novo programa" })).toBeVisible()
    await expect(page.locator("#template-name")).toBeVisible()
  })

  test("validates required fields", async ({ page }) => {
    await page.getByTestId("create-template-button").click()
    await expect(page.getByRole("heading", { name: "Novo programa" })).toBeVisible()

    await page.getByTestId("template-submit-button").click()
    await expect(page.getByText("Nome deve ter ao menos 3 caracteres")).toBeVisible()
  })

  test("creates program template", async ({ page }) => {
    createdTemplateName = `E2E ${generateUniqueName()}`

    await page.getByTestId("create-template-button").click()
    await expect(page.getByRole("heading", { name: "Novo programa" })).toBeVisible()

    await page.getByTestId("template-name-input").fill(createdTemplateName)
    await page.getByTestId("template-description-input").fill("Descrição de teste E2E")

    await page.getByTestId("template-submit-button").click()

    await expect(page.getByRole("heading", { name: "Novo programa" })).not.toBeVisible()
    await expect(page.getByText(createdTemplateName)).toBeVisible()
  })

  test("created template appears in list", async ({ page }) => {
    if (!createdTemplateName) test.skip()

    await page.getByTestId("template-search").fill(createdTemplateName)
    await page.waitForURL(/search=/, { timeout: 5000 })
    await expect(page.getByText(createdTemplateName)).toBeVisible()
  })
})

test.describe("Edit Program Template", () => {
  test.describe.configure({ mode: "serial" })

  let templateName: string
  let updatedName: string

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })
  })

  test("creates template then opens edit dialog", async ({ page }) => {
    templateName = `E2E Edit ${generateUniqueName()}`
    updatedName = `${templateName} Updated`

    // Create first
    await page.getByTestId("create-template-button").click()
    await page.getByTestId("template-name-input").fill(templateName)
    await page.getByTestId("template-submit-button").click()

    await expect(page.getByText(templateName)).toBeVisible()

    // Hover and open actions
    const card = page.getByTestId("template-card").filter({ hasText: templateName }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("edit-template").click()

    await expect(page.getByRole("heading", { name: "Editar programa" })).toBeVisible()
  })

  test("updates template name", async ({ page }) => {
    if (!templateName) test.skip()

    await page.getByTestId("template-search").fill(templateName)
    await page.waitForURL(/search=/, { timeout: 5000 })
    await expect(page.getByText(templateName)).toBeVisible()

    const card = page.getByTestId("template-card").filter({ hasText: templateName }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("edit-template").click()

    await expect(page.getByRole("heading", { name: "Editar programa" })).toBeVisible()
    await page.locator("#template-name").clear()
    await page.locator("#template-name").fill(updatedName)

    await page.getByTestId("template-submit-button").click()

    await expect(page.getByRole("heading", { name: "Editar programa" })).not.toBeVisible()
    await expect(page.getByText(updatedName)).toBeVisible()
  })
})

test.describe("Duplicate Program Template", () => {
  test.describe.configure({ mode: "serial" })

  let templateName: string

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })
  })

  test("duplicates a template", async ({ page }) => {
    templateName = `E2E Dup ${generateUniqueName()}`

    // Create first
    await page.getByTestId("create-template-button").click()
    await page.getByTestId("template-name-input").fill(templateName)
    await page.getByTestId("template-submit-button").click()
    await expect(page.getByText(templateName)).toBeVisible()

    // Duplicate
    const card = page.getByTestId("template-card").filter({ hasText: templateName }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("duplicate-template").click()

    // The copy should appear (with "(cópia)" suffix)
    await expect(page.getByText(`${templateName} (cópia)`)).toBeVisible()
  })
})

test.describe("Delete Program Template", () => {
  test.describe.configure({ mode: "serial" })

  let templateName: string

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })
  })

  test("deletes template with confirmation", async ({ page }) => {
    templateName = `E2E Delete ${generateUniqueName()}`

    // Create first
    await page.getByTestId("create-template-button").click()
    await page.getByTestId("template-name-input").fill(templateName)
    await page.getByTestId("template-submit-button").click()
    await expect(page.getByText(templateName)).toBeVisible()

    // Delete
    const card = page.getByTestId("template-card").filter({ hasText: templateName }).first()
    await card.hover()
    await card.getByTestId("template-actions").click()
    await page.getByTestId("delete-template").click()

    await expect(page.getByRole("heading", { name: "Excluir programa" })).toBeVisible()
    await page.getByTestId("confirm-delete-template").click()

    await expect(page.getByText(templateName)).not.toBeVisible()
  })
})

test.describe("Program Template Builder", () => {
  test.describe.configure({ mode: "serial" })

  let templateName: string
  let templateId: string

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })
  })

  test("creates template and navigates to builder", async ({ page }) => {
    templateName = `E2E Builder ${generateUniqueName()}`

    await page.getByTestId("create-template-button").click()
    await page.getByTestId("template-name-input").fill(templateName)
    await page.getByTestId("template-submit-button").click()
    await expect(page.getByText(templateName)).toBeVisible()

    // Navigate to builder
    const card = page.getByTestId("template-card").filter({ hasText: templateName }).first()
    await card.getByTestId("template-name-link").click()

    await expect(page).toHaveURL(/training-templates\//)
    await expect(page.getByRole("heading", { name: templateName })).toBeVisible()

    // Capture the template ID from the URL
    templateId = page.url().split("/training-templates/")[1]
  })

  test("adds a workout to the template", async ({ page }) => {
    if (!templateId) test.skip()

    await page.goto(`/training-templates/${templateId}`)
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='workout-template-card']", {
      timeout: 8000,
    })

    // Add workout
    await page.getByTestId("add-first-workout-button").click()
    await expect(page.getByRole("heading", { name: "Novo treino" })).toBeVisible()

    await page.getByTestId("workout-name-input").fill("Treino A - Peito")
    await page.getByTestId("workout-submit-button").click()

    await expect(page.getByRole("heading", { name: "Novo treino" })).not.toBeVisible()
    await expect(page.getByText("Treino A - Peito")).toBeVisible()
  })

  test("adds a second workout and reorders", async ({ page }) => {
    if (!templateId) test.skip()

    await page.goto(`/training-templates/${templateId}`)
    await page.waitForSelector("[data-testid='workout-template-card']", { timeout: 8000 })

    await page.getByTestId("add-workout-button").click()
    await page.getByTestId("workout-name-input").fill("Treino B - Costas")
    await page.getByTestId("workout-submit-button").click()
    await expect(page.getByText("Treino B - Costas")).toBeVisible()

    // Move second workout up (should become first)
    const cards = page.getByTestId("workout-template-card")
    await cards.last().getByTestId("workout-move-up").click()

    // Both workouts should still be visible
    await expect(page.getByText("Treino A - Peito")).toBeVisible()
    await expect(page.getByText("Treino B - Costas")).toBeVisible()
  })

  test("adds an exercise to the workout", async ({ page }) => {
    if (!templateId) test.skip()

    await page.goto(`/training-templates/${templateId}`)
    await page.waitForSelector("[data-testid='workout-template-card']", { timeout: 8000 })

    // Expand first workout
    const firstCard = page.getByTestId("workout-template-card").first()
    await firstCard.getByTestId("workout-toggle").click()

    // Add exercise
    await firstCard.getByTestId("add-exercise-button").click()
    await expect(page.getByRole("heading", { name: "Selecionar exercício" })).toBeVisible()

    // Pick first exercise from list
    const firstExerciseOption = page.getByTestId("exercise-option").first()
    await firstExerciseOption.click()

    // Fill params
    await expect(page.getByRole("heading", { name: "Configurar exercício" })).toBeVisible()
    await page.getByTestId("exercise-sets-input").fill("4")
    await page.getByTestId("exercise-reps-input").fill("12")

    await page.getByTestId("add-exercise-submit").click()
    await expect(page.getByRole("heading", { name: "Configurar exercício" })).not.toBeVisible()

    // Exercise should be visible in the workout
    await expect(page.getByTestId("exercise-template-item").first()).toBeVisible()
  })

  test("deletes workout from builder", async ({ page }) => {
    if (!templateId) test.skip()

    await page.goto(`/training-templates/${templateId}`)
    await page.waitForSelector("[data-testid='workout-template-card']", { timeout: 8000 })

    // Delete the last workout
    const lastCard = page.getByTestId("workout-template-card").last()
    const workoutName = await lastCard.locator("span.font-medium").first().textContent()
    await lastCard.getByTestId("delete-workout").click()

    await expect(page.getByRole("heading", { name: "Remover treino" })).toBeVisible()
    await page.getByTestId("confirm-delete-workout").click()

    if (workoutName) {
      await expect(page.getByText(workoutName)).not.toBeVisible()
    }
  })
})

test.describe("Mobile View", () => {
  test.use({ viewport: { width: 412, height: 915 } })

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page)
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })
  })

  test("shows training templates page on mobile", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Programas de Treino" })).toBeVisible()
  })

  test("search works on mobile", async ({ page }) => {
    await page.getByTestId("template-search").fill("xyznonexistent")
    await page.waitForURL(/search=xyznonexistent/, { timeout: 5000 })
    await expect(page.getByText("Nenhum programa encontrado")).toBeVisible()
  })
})
