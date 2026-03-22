import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  injectStudentMockAuth,
  mockExercisesList,
  mockEnumMuscleGroups,
  mockProgramTemplatesList,
  mockProgramTemplateDetail,
  mockStudentsList,
  mockDashboardStats,
} from "../support/apiMocks"
import {
  GLOBAL_EXERCISES,
  TEMPLATES,
  STUDENTS,
  DASHBOARD_STATS,
  MOCK_TENANT_ID,
} from "../utils/comprehensiveFixtures"

function paginated(content: object[], page = 0, size = 20) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

// =============================================================================
// Invalid States — Edge cases and validation
// =============================================================================

test.describe("Critical — Invalid States", () => {
  test("create student form validates required fields", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentsList(page, paginated(STUDENTS))

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    await page.getByRole("button", { name: /novo aluno/i }).click()

    // Try to submit empty form
    const saveBtn = page.getByRole("button", { name: /salvar/i })
    await saveBtn.click()

    // Form should show validation errors or remain open
    await page.waitForTimeout(1000)
    const dialogStillOpen = await page.locator("#name").isVisible()
    expect(dialogStillOpen).toBe(true)
  })

  test("create exercise form validates required fields", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumMuscleGroups(page)
    await mockExercisesList(page, paginated(GLOBAL_EXERCISES, 0, 9))

    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 10000 })

    await page.getByRole("button", { name: /criar exercício/i }).click()
    await expect(page.getByRole("heading", { name: /novo exercício/i })).toBeVisible()

    // Try to save without filling required fields
    await page.getByRole("button", { name: /salvar/i }).click()

    // Dialog should remain open (validation prevents submission)
    await page.waitForTimeout(1000)
    await expect(page.getByRole("heading", { name: /novo exercício/i })).toBeVisible()
  })

  test("create template form validates name is required", async ({ page }) => {
    await injectMockAuth(page)
    await mockProgramTemplatesList(page, paginated(TEMPLATES, 0, 12))

    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 10000,
    })

    await page.getByTestId("create-template-button").click()

    // Submit without name
    await page.getByTestId("template-submit-button").click()

    // Dialog should remain open
    await page.waitForTimeout(1000)
    await expect(page.locator("#template-name")).toBeVisible()
  })

  test("empty student list shows empty state", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentsList(page, paginated([]))

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state']", { timeout: 10000 })

    await expect(page.locator("[data-slot='empty-state']")).toBeVisible()
    await expect(page.getByText("Nenhum aluno encontrado")).toBeVisible()
  })

  test("empty exercise list shows empty state", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumMuscleGroups(page)
    await mockExercisesList(page, paginated([], 0, 9))

    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 10000 })

    await expect(page.locator("[data-slot='empty-state']")).toBeVisible()
  })

  test("empty template list shows empty state", async ({ page }) => {
    await injectMockAuth(page)
    await mockProgramTemplatesList(page, paginated([], 0, 12))

    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state']", { timeout: 10000 })

    await expect(page.locator("[data-slot='empty-state']")).toBeVisible()
  })
})
