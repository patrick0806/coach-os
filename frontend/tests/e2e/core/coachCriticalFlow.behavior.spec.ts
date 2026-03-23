import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockDashboardStats,
  mockStudentsListStateful,
  mockCreateStudent,
  mockExercisesListStateful,
  mockCreateExercise,
  mockEnumMuscleGroups,
  mockProgramTemplatesListStateful,
  mockCreateProgramTemplate,
  mockServicePlansList,
  mockEnumAttendanceTypes,
  mockAvailabilityRules,
  mockGetMyProfile,
  mockSaveLpDraft,
  mockPublishLpDraft,
} from "../support/apiMocks"
import {
  DASHBOARD_STATS,
  studentsPaginated,
  exercisesPaginated,
  templatesPaginated,
  SERVICE_PLANS,
  AVAILABILITY_RULES,
  PROFILE_COMPLETE,
  MOCK_TENANT_ID,
} from "../utils/comprehensiveFixtures"

function paginated<T>(content: T[], page = 0, size = 20) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

test.describe("Core E2E — Coach critical flow", () => {
  test("coach atravessa as telas principais sem quebrar o fluxo", async ({ page }) => {
    const newStudent = {
      id: "student-core-1",
      name: "Aluno Fluxo Core",
      email: "aluno.core@e2e.test",
      status: "active",
      phoneNumber: null,
      goal: null,
      observations: null,
      physicalRestrictions: null,
      createdAt: new Date().toISOString(),
    }
    const newExercise = {
      id: "exercise-core-1",
      name: "Remada Core",
      muscleGroup: "costas",
      description: null,
      instructions: null,
      mediaUrl: null,
      youtubeUrl: null,
      tenantId: MOCK_TENANT_ID,
      createdAt: new Date().toISOString(),
    }
    const newTemplate = {
      id: "template-core-1",
      name: "Programa Core",
      description: "Fluxo essencial",
      status: "active",
      workoutCount: 1,
      createdAt: new Date().toISOString(),
    }

    await injectMockAuth(page)
    await mockDashboardStats(page, DASHBOARD_STATS)
    await mockStudentsListStateful(page, studentsPaginated, paginated([...studentsPaginated.content, newStudent]))
    await mockCreateStudent(page, newStudent)
    await mockEnumMuscleGroups(page)
    await mockExercisesListStateful(
      page,
      exercisesPaginated,
      paginated([...exercisesPaginated.content, newExercise], 0, 9)
    )
    await mockCreateExercise(page, newExercise)
    await mockProgramTemplatesListStateful(
      page,
      templatesPaginated,
      paginated([...templatesPaginated.content, newTemplate], 0, 12)
    )
    await mockCreateProgramTemplate(page, newTemplate)
    await mockEnumAttendanceTypes(page)
    await mockServicePlansList(page, SERVICE_PLANS)
    await mockAvailabilityRules(page, AVAILABILITY_RULES)
    await mockGetMyProfile(page, PROFILE_COMPLETE)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)

    await page.goto("/dashboard")
    await expect(page.locator("[data-slot='page-header'], h1, h2").first()).toBeVisible()

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='student-card'], tbody tr", {
      state: "attached",
      timeout: 8000,
    })
    await page.getByRole("button", { name: "Novo aluno" }).click()
    await page.locator("#name").fill(newStudent.name)
    await page.locator("#email").fill(newStudent.email)
    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByText(newStudent.name).filter({ visible: true }).first()).toBeVisible()

    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 })
    await page.getByRole("button", { name: "Criar exercício" }).click()
    await page.locator("#exercise-name").fill(newExercise.name)
    await page.locator("#exercise-muscleGroup").click()
    await page.getByRole("option", { name: "Costas" }).click()
    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByText(newExercise.name)).toBeVisible()

    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 8000,
    })
    await page.getByTestId("create-template-button").click()
    await page.getByTestId("template-name-input").fill(newTemplate.name)
    await page.getByTestId("template-description-input").fill(newTemplate.description)
    await page.getByTestId("template-submit-button").click()
    await expect(page.getByText(newTemplate.name)).toBeVisible()

    await page.goto("/services")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='service-plans-list']", {
      timeout: 8000,
    })
    await expect(page.getByRole("heading", { name: "Planos de Serviço" })).toBeVisible()
    await expect(page.getByTestId("create-plan-button")).toBeVisible()

    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })
    await expect(page.getByRole("heading", { name: "Disponibilidade" })).toBeVisible()

    await page.goto("/pagina-publica")
    await page.waitForSelector("#specialties", { timeout: 8000 })
    await expect(page.getByRole("heading", { name: "Página Pública" })).toBeVisible()
    await expect(page.locator("[data-testid='slug-input']")).toHaveValue(PROFILE_COMPLETE.slug)
  })
})
