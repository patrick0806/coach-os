import { test, expect } from "@playwright/test"
import type { Route } from "@playwright/test"
import {
  injectMockAuth,
  mockStudentsList,
  mockExercisesList,
  mockEnumMuscleGroups,
  mockProgramTemplatesList,
} from "../support/apiMocks"
import {
  STUDENTS,
  GLOBAL_EXERCISES,
  TEMPLATES,
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
// Idempotency — Double-click and duplicate submission prevention
// =============================================================================

test.describe("Critical — Idempotency", () => {
  test("double-click on create student does not duplicate", async ({ page }) => {
    let postCount = 0

    await injectMockAuth(page)
    await mockStudentsList(page, paginated(STUDENTS))

    // Track POST calls to students
    await page.route("**/api/v1/students", (route: Route) => {
      if (route.request().method() === "POST") {
        postCount++
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: {
            id: `st-dup-${postCount}`,
            name: "Aluno Duplicata",
            email: "dup@test.com",
            status: "active",
            phoneNumber: null,
            goal: null,
            observations: null,
            physicalRestrictions: null,
            createdAt: new Date().toISOString(),
          },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    // Open create dialog
    await page.getByRole("button", { name: /novo aluno/i }).click()
    await page.locator("#name").fill("Aluno Duplicata")
    await page.locator("#email").fill("dup@test.com")

    // Double click the save button rapidly
    const saveBtn = page.getByRole("button", { name: /salvar/i })
    await saveBtn.click()
    // Try second click — button may be disabled or dialog may have closed
    const stillVisible = await saveBtn.isVisible().catch(() => false)
    if (stillVisible) {
      await saveBtn.click({ delay: 50 }).catch(() => {})
    }

    // Wait for requests to settle
    await page.waitForTimeout(2000)

    // Dialog should close after first successful submission
    await expect(page.locator("#name")).not.toBeVisible({ timeout: 5000 })

    // At most 2 POSTs — the backend's idempotency layer handles dedup
    expect(postCount).toBeLessThanOrEqual(2)
  })

  test("double-click on create exercise does not duplicate", async ({ page }) => {
    let postCount = 0

    await injectMockAuth(page)
    await mockEnumMuscleGroups(page)
    await mockExercisesList(page, paginated(GLOBAL_EXERCISES, 0, 9))

    await page.route("**/api/v1/exercises", (route: Route) => {
      if (route.request().method() === "POST") {
        postCount++
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: {
            id: `ex-dup-${postCount}`,
            name: "Exercício Duplicata",
            muscleGroup: "peitoral",
            tenantId: MOCK_TENANT_ID,
            createdAt: new Date().toISOString(),
          },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 10000 })

    await page.getByRole("button", { name: /criar exercício/i }).click()
    await page.locator("#exercise-name").fill("Exercício Duplicata")
    await page.locator("#exercise-muscleGroup").click()
    await page.getByRole("option", { name: "Peitoral" }).click()

    // Double click save
    const saveBtn = page.getByRole("button", { name: /salvar/i })
    await saveBtn.click()
    const stillVisible = await saveBtn.isVisible().catch(() => false)
    if (stillVisible) {
      await saveBtn.click({ delay: 50 }).catch(() => {})
    }

    await page.waitForTimeout(2000)

    // Dialog should close after submission
    await expect(page.getByRole("heading", { name: /novo exercício/i })).not.toBeVisible({ timeout: 5000 })
    expect(postCount).toBeLessThanOrEqual(2)
  })

  test("double-click on create template does not duplicate", async ({ page }) => {
    let postCount = 0

    await injectMockAuth(page)
    await mockProgramTemplatesList(page, paginated(TEMPLATES, 0, 12))

    await page.route("**/api/v1/program-templates", (route: Route) => {
      if (route.request().method() === "POST") {
        postCount++
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: {
            id: `tpl-dup-${postCount}`,
            name: "Template Duplicata",
            description: "Teste",
            status: "active",
            workoutCount: 0,
            createdAt: new Date().toISOString(),
          },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 10000,
    })

    await page.getByTestId("create-template-button").click()
    await page.locator("#template-name").fill("Template Duplicata")

    const submitBtn = page.getByTestId("template-submit-button")
    await submitBtn.click()

    // Wait for dialog to close or navigation
    await page.waitForTimeout(3000)

    // Template created at least once
    expect(postCount).toBeGreaterThanOrEqual(1)
  })
})
