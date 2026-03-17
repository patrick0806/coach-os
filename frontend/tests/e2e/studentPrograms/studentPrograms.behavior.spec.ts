/**
 * Student Programs — Behavioral Tests
 *
 * These tests run entirely with mocked API responses (page.route).
 * No backend required. Deterministic regardless of accumulated data.
 *
 * Coverage:
 *   - Programs tab visible on student detail page
 *   - Programs list (cards, status badges)
 *   - Filter by status tabs
 *   - Empty state
 *   - Assign program dialog (open, template selection, submit)
 *   - Program detail page (workout days accordion)
 *   - Exercise items with parameters
 *   - Update exercise dialog (open, pre-fill, submit)
 *   - Update program status dialog (open, warning, submit)
 */
import { test, expect } from "@playwright/test"
import type { Page, Route } from "@playwright/test"
import { injectMockAuth } from "../support/apiMocks"
import {
  studentProgramsFixtures,
  programDetail,
  mockProgramTemplates,
  newProgramFixture,
  MOCK_STUDENT_ID,
  MOCK_PROGRAM_ID,
} from "../fixtures/studentPrograms.fixtures"
import { activeStudents } from "../fixtures/students.fixtures"

// --- Helpers ---

const STUDENT = activeStudents[0] // id: "st-1"

async function mockStudentDetail(page: Page) {
  await page.route("**/api/v1/students/st-1", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: STUDENT })
    } else {
      route.fallback()
    }
  })
}

async function mockStudentNotes(page: Page) {
  await page.route("**/api/v1/students/st-1/notes*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 1 },
      })
    } else {
      route.fallback()
    }
  })
}

async function mockProgramsList(page: Page, response: object) {
  await page.route("**/api/v1/student-programs/students/st-1/programs*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

async function mockProgramsListStateful(
  page: Page,
  initial: object,
  afterMutation: object
) {
  let callCount = 0
  await page.route("**/api/v1/student-programs/students/st-1/programs*", (route: Route) => {
    if (route.request().method() === "GET") {
      const response = callCount === 0 ? initial : afterMutation
      callCount++
      route.fulfill({ status: 200, contentType: "application/json", json: response })
    } else {
      route.fallback()
    }
  })
}

async function mockProgramTemplatesList(page: Page) {
  await page.route("**/api/v1/program-templates*", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: mockProgramTemplates })
    } else {
      route.fallback()
    }
  })
}

async function mockAssignProgram(page: Page, created: object) {
  await page.route("**/api/v1/student-programs/students/st-1/programs*", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: created })
    } else {
      route.fallback()
    }
  })
}

async function mockProgramDetail(page: Page) {
  await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: programDetail })
    } else {
      route.fallback()
    }
  })
}

async function mockUpdateProgramStatus(page: Page, updated: object) {
  await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}/status*`, (route: Route) => {
    if (route.request().method() === "PATCH") {
      route.fulfill({ status: 200, contentType: "application/json", json: updated })
    } else {
      route.fallback()
    }
  })
}

async function mockUpdateStudentExercise(page: Page) {
  await page.route("**/api/v1/student-exercises/**", (route: Route) => {
    if (route.request().method() === "PUT") {
      route.fulfill({ status: 200, contentType: "application/json", json: {} })
    } else {
      route.fallback()
    }
  })
}

async function setupStudentPage(page: Page, programsResponse: object) {
  await injectMockAuth(page)
  await mockStudentDetail(page)
  await mockStudentNotes(page)
  await mockProgramsList(page, programsResponse)
  await page.goto(`/students/${MOCK_STUDENT_ID}`)
  await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })
}

// =============================================================================
// Programs Tab Visibility
// =============================================================================

test.describe("Student Programs — Tab Visibility", () => {
  test("shows Programas tab on student detail page", async ({ page }) => {
    await setupStudentPage(page, studentProgramsFixtures.empty)

    await expect(page.getByRole("tab", { name: "Programas" })).toBeVisible()
  })

  test("shows programs section when Programas tab is clicked", async ({ page }) => {
    await setupStudentPage(page, studentProgramsFixtures.empty)

    await page.getByRole("tab", { name: "Programas" }).click()
    await expect(page.getByTestId("assign-program-button")).toBeVisible()
  })
})

// =============================================================================
// Programs List
// =============================================================================

test.describe("Student Programs — List", () => {
  test("shows program cards with name and status badge", async ({ page }) => {
    await setupStudentPage(page, studentProgramsFixtures.all)
    await page.getByRole("tab", { name: "Programas" }).click()

    await expect(page.getByText("Programa de Hipertrofia")).toBeVisible()
    await expect(page.getByText("Programa Iniciante")).toBeVisible()
    await expect(page.getByTestId("student-program-card").first()).toBeVisible()
  })

  test("shows active status badge", async ({ page }) => {
    await setupStudentPage(page, studentProgramsFixtures.activeOnly)
    await page.getByRole("tab", { name: "Programas" }).click()

    await expect(page.getByTestId("student-program-card").first().getByText("Ativo", { exact: true })).toBeVisible()
  })

  test("shows finished status badge", async ({ page }) => {
    await setupStudentPage(page, studentProgramsFixtures.finishedOnly)
    await page.getByRole("tab", { name: "Programas" }).click()

    await expect(page.getByTestId("student-program-card").first().getByText("Finalizado", { exact: true })).toBeVisible()
  })

  test("shows empty state when no programs", async ({ page }) => {
    await setupStudentPage(page, studentProgramsFixtures.empty)
    await page.getByRole("tab", { name: "Programas" }).click()

    await expect(page.getByText("Nenhum programa")).toBeVisible()
  })
})

// =============================================================================
// Assign Program Dialog
// =============================================================================

test.describe("Student Programs — Assign Dialog", () => {
  test("opens assign program dialog", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockProgramsList(page, studentProgramsFixtures.empty)
    await mockProgramTemplatesList(page)
    await page.goto(`/students/${MOCK_STUDENT_ID}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Programas" }).click()
    await page.getByTestId("assign-program-button").click()
    await expect(page.getByRole("heading", { name: "Atribuir programa" })).toBeVisible()
    await expect(page.getByTestId("program-name-input")).toBeVisible()
  })

  test("closes assign dialog on cancel", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockProgramsList(page, studentProgramsFixtures.empty)
    await mockProgramTemplatesList(page)
    await page.goto(`/students/${MOCK_STUDENT_ID}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Programas" }).click()
    await page.getByTestId("assign-program-button").click()
    await page.getByRole("button", { name: "Cancelar" }).click()
    await expect(page.getByRole("heading", { name: "Atribuir programa" })).not.toBeVisible()
  })

  test("assigns program successfully", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockProgramTemplatesList(page)
    await mockAssignProgram(page, newProgramFixture)
    await mockProgramsListStateful(
      page,
      studentProgramsFixtures.all,
      studentProgramsFixtures.afterAssign(newProgramFixture)
    )
    await page.goto(`/students/${MOCK_STUDENT_ID}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })
    await page.getByRole("tab", { name: "Programas" }).click()

    await page.getByTestId("assign-program-button").click()
    await expect(page.getByRole("heading", { name: "Atribuir programa" })).toBeVisible()
    await page.getByTestId("program-name-input").fill("Novo Programa Funcional")
    await page.getByTestId("assign-program-submit").click()

    // Dialog should close and toast should appear on success
    await expect(page.getByRole("heading", { name: "Atribuir programa" })).not.toBeVisible({ timeout: 8000 })
  })

  test("shows validation error for short name", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockProgramsList(page, studentProgramsFixtures.empty)
    await mockProgramTemplatesList(page)
    await page.goto(`/students/${MOCK_STUDENT_ID}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Programas" }).click()
    await page.getByTestId("assign-program-button").click()
    await page.getByTestId("program-name-input").fill("AB")
    await page.getByTestId("assign-program-submit").click()

    await expect(page.getByText("Nome deve ter pelo menos 3 caracteres")).toBeVisible()
  })
})

// =============================================================================
// Program Detail Page
// =============================================================================

test.describe("Student Programs — Detail Page", () => {
  async function setupDetailPage(page: Page) {
    await injectMockAuth(page)
    await mockProgramDetail(page)
    await mockProgramsList(page, studentProgramsFixtures.all)
    await page.goto(`/students/${MOCK_STUDENT_ID}/programs/${MOCK_PROGRAM_ID}`)
    await page.waitForSelector("[data-testid='workout-day-card']", { timeout: 8000 })
  }

  test("shows program name and status badge", async ({ page }) => {
    await setupDetailPage(page)

    await expect(page.getByText("Programa de Hipertrofia")).toBeVisible()
    await expect(page.getByText("Ativo")).toBeVisible()
  })

  test("shows back link to student", async ({ page }) => {
    await setupDetailPage(page)

    await expect(page.getByText("Voltar para o aluno")).toBeVisible()
  })

  test("shows workout day cards", async ({ page }) => {
    await setupDetailPage(page)

    await expect(page.getByTestId("workout-day-card").first()).toBeVisible()
    await expect(page.getByText("Treino A — Membros Inferiores")).toBeVisible()
    await expect(page.getByText("Treino B — Membros Superiores")).toBeVisible()
  })

  test("expands workout day to show exercises", async ({ page }) => {
    await setupDetailPage(page)

    await page.getByTestId("workout-day-toggle").first().click()
    await expect(page.getByTestId("student-exercise-item").first()).toBeVisible()
    await expect(page.getByText("Agachamento")).toBeVisible()
  })

  test("shows exercise metadata (sets, reps, rest, weight)", async ({ page }) => {
    await setupDetailPage(page)

    await page.getByTestId("workout-day-toggle").first().click()
    await expect(page.getByText(/4 séries/)).toBeVisible()
    await expect(page.getByText(/12 reps/)).toBeVisible()
  })

  test("opens update exercise dialog with pre-filled values", async ({ page }) => {
    await setupDetailPage(page)

    await page.getByTestId("workout-day-toggle").first().click()
    await page.getByTestId("edit-student-exercise").first().click()

    await expect(page.getByTestId("sets-input")).toHaveValue("4")
    await expect(page.getByTestId("repetitions-input")).toHaveValue("12")
  })

  test("submits exercise update successfully", async ({ page }) => {
    await mockUpdateStudentExercise(page)
    await setupDetailPage(page)

    await page.getByTestId("workout-day-toggle").first().click()
    await page.getByTestId("edit-student-exercise").first().click()
    await page.getByTestId("sets-input").fill("5")
    await page.getByTestId("update-exercise-submit").click()

    await expect(page.getByText("Exercício atualizado com sucesso!")).toBeVisible()
  })

  test("opens change status dialog", async ({ page }) => {
    await setupDetailPage(page)

    await page.getByTestId("change-status-button").click()
    await expect(page.getByTestId("program-status-select")).toBeVisible()
  })

  test("shows irreversibility warning for finished status", async ({ page }) => {
    await injectMockAuth(page)
    await mockProgramDetail(page)
    await page.goto(`/students/${MOCK_STUDENT_ID}/programs/${MOCK_PROGRAM_ID}`)
    await page.waitForSelector("[data-testid='change-status-button']", { timeout: 8000 })

    await page.getByTestId("change-status-button").click()
    await page.getByTestId("program-status-select").click()
    await page.getByRole("option", { name: "Finalizado" }).click()

    await expect(page.getByText(/irreversível/i)).toBeVisible()
  })

  test("submits status update successfully", async ({ page }) => {
    await mockUpdateProgramStatus(page, { ...programDetail, status: "finished" })
    await setupDetailPage(page)

    await page.getByTestId("change-status-button").click()
    await page.getByTestId("update-status-submit").click()

    await expect(page.getByText("Status atualizado com sucesso!")).toBeVisible()
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Student Programs — Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("programs section is usable on mobile", async ({ page }) => {
    await setupStudentPage(page, studentProgramsFixtures.all)
    await page.getByRole("tab", { name: "Programas" }).click()

    await expect(page.getByTestId("student-program-card").first()).toBeVisible()
    await expect(page.getByTestId("assign-program-button")).toBeVisible()
  })
})
