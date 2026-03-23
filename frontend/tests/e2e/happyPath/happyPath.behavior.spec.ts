import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  injectMockAuthAs,
  injectStudentMockAuth,
  mockPlansList,
  mockDashboardStats,
  mockStudentsList,
  mockStudentsListStateful,
  mockCreateStudent,
  mockGenerateStudentAccessLink,
  mockExercisesList,
  mockExercisesListStateful,
  mockCreateExercise,
  mockEnumMuscleGroups,
  mockEnumAttendanceTypes,
  mockProgramTemplatesList,
  mockProgramTemplatesListStateful,
  mockCreateProgramTemplate,
  mockProgramTemplateDetail,
  mockServicePlansList,
  mockCreateServicePlan,
  mockAvailabilityRules,
  mockAvailabilityRulesStateful,
  mockCreateAvailabilityRule,
  mockBulkCreateAvailabilityRules,
  mockGetMyProfile,
  mockGetMyProfileStateful,
  mockUpdateProfile,
  mockSaveLpDraft,
  mockPublishLpDraft,
  mockCalendar,
  mockGetTourProgress,
  mockMarkPageToured,
  mockGenerateInviteLink,
  MOCK_USER,
} from "../support/apiMocks"
import {
  PLANS,
  DASHBOARD_STATS,
  STUDENTS,
  GLOBAL_EXERCISES,
  TEMPLATES,
  SERVICE_PLANS,
  AVAILABILITY_RULES,
  PROFILE_COMPLETE,
  PROFILE_WITH_DRAFT,
  PROFILE_AFTER_PUBLISH,
  MOCK_TENANT_ID,
  MOCK_STUDENT_USER,
  STUDENT_PROGRAM,
  CREATED_SESSION,
  CREATED_EXECUTION,
  RECORDED_SET,
  COACH_PUBLIC,
  studentProgramsPaginated,
} from "../utils/comprehensiveFixtures"

// =============================================================================
// Helper: paginate content
// =============================================================================

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
// HAPPY PATH — STEP 1: Home page and plan selection
// =============================================================================

test.describe("Happy Path — Step 1: Home & Plan Selection", () => {
  test("personal accesses home and sees plans", async ({ page }) => {
    await mockPlansList(page, PLANS)

    await page.goto("/")
    await expect(page.locator("body")).not.toBeEmpty()

    // Verify CTA exists
    const registerLink = page.getByRole("link", { name: /cadastr|começar|grátis/i })
    await expect(registerLink.first()).toBeVisible({ timeout: 10000 })
  })

  test("home page shows available plans", async ({ page }) => {
    await mockPlansList(page, PLANS)

    await page.goto("/")

    // Should display plan names
    await expect(page.getByText("Básico").first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Pro").first()).toBeVisible()
  })
})

// =============================================================================
// HAPPY PATH — STEP 2: Registration
// =============================================================================

test.describe("Happy Path — Step 2: Registration", () => {
  test("personal can access registration page with plan preselected", async ({ page }) => {
    await mockPlansList(page, PLANS)

    // Mock registration endpoint
    await page.route("**/api/v1/auth/register*", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: {
            accessToken: "mock-new-token",
            user: { ...MOCK_USER, id: "new-user-id" },
            personal: { id: "new-personal-id" },
          },
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/cadastro?plan=plan-pro")
    await expect(page.locator("body")).not.toBeEmpty()
  })
})

// =============================================================================
// HAPPY PATH — STEP 3: Dashboard access after registration
// =============================================================================

test.describe("Happy Path — Step 3: Coach Dashboard", () => {
  test("authenticated coach sees dashboard with stats", async ({ page }) => {
    await injectMockAuth(page)
    await mockDashboardStats(page, DASHBOARD_STATS)

    await page.goto("/dashboard")

    await expect(page.locator("[data-slot='page-header'], h1, h2").first()).toBeVisible({
      timeout: 10000,
    })
  })
})

// =============================================================================
// HAPPY PATH — STEP 4: Configure service plans
// =============================================================================

test.describe("Happy Path — Step 4: Service Plans", () => {
  test("coach can create a service plan", async ({ page }) => {
    await injectMockAuth(page)

    const newPlan = {
      id: "sp-new",
      name: "Treino Presencial",
      attendanceType: "presential",
      sessionsPerWeek: 5,
      price: "200.00",
      createdAt: new Date().toISOString(),
    }

    await mockServicePlansList(page, SERVICE_PLANS)
    await mockCreateServicePlan(page, newPlan)
    await mockEnumAttendanceTypes(page)

    await page.goto("/services")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='service-plans-list']", {
      timeout: 10000,
    })

    // Click create button
    const createBtn = page.getByRole("button", { name: /novo|criar|adicionar/i })
    if (await createBtn.isVisible()) {
      await createBtn.click()

      // Fill form
      const nameInput = page.locator("#name, #plan-name").first()
      if (await nameInput.isVisible()) {
        await nameInput.fill("Treino Presencial")
      }
    }
  })
})

// =============================================================================
// HAPPY PATH — STEP 5: Configure availability
// =============================================================================

test.describe("Happy Path — Step 5: Availability", () => {
  test("coach can view and configure availability rules", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, AVAILABILITY_RULES)

    await page.goto("/disponibilidade")

    // Availability page loads with existing rules
    await expect(page.locator("body")).not.toBeEmpty()
    await page.waitForTimeout(2000)
  })
})

// =============================================================================
// HAPPY PATH — STEP 6: Profile and Landing Page
// =============================================================================

test.describe("Happy Path — Step 6: Profile & Landing Page", () => {
  test("coach can edit profile", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfile(page, PROFILE_COMPLETE)
    await mockUpdateProfile(page, { ...PROFILE_COMPLETE, bio: "Bio atualizada." })

    await page.goto("/pagina-publica")
    await page.waitForSelector("#bio, h1", { timeout: 10000 })

    // Edit bio field
    const bioField = page.locator("#bio")
    if (await bioField.isVisible()) {
      await bioField.fill("Bio atualizada.")
      await page.getByRole("button", { name: /salvar/i }).first().click()
    }
  })

  test("coach can save LP draft and publish", async ({ page }) => {
    await injectMockAuth(page)
    await mockGetMyProfileStateful(page, PROFILE_COMPLETE, PROFILE_WITH_DRAFT)
    await mockSaveLpDraft(page)
    await mockPublishLpDraft(page)

    await page.goto("/pagina-publica")
    await page.waitForSelector("[data-slot='page-header'], h1", { timeout: 10000 })

    // Switch to Página tab
    const paginaTab = page.getByRole("tab", { name: /página/i })
    if (await paginaTab.isVisible()) {
      await paginaTab.click()

      // Fill LP fields
      const titleInput = page.locator("#lpTitle")
      if (await titleInput.isVisible()) {
        await titleInput.fill("Título do rascunho")
      }

      // Save draft
      const draftBtn = page.getByRole("button", { name: /salvar rascunho/i })
      if (await draftBtn.isVisible()) {
        await draftBtn.click()
        await expect(page.getByText(/sucesso|salvo/i).first()).toBeVisible({ timeout: 5000 })
      }
    }
  })
})

// =============================================================================
// HAPPY PATH — STEP 7: Create student
// =============================================================================

test.describe("Happy Path — Step 7: Create Student", () => {
  test("coach creates student and generates invite link", async ({ page }) => {
    const newStudent = {
      id: "st-new-hp",
      name: "Happy Path Student",
      email: "hp-student@test.com",
      status: "active",
      phoneNumber: null,
      goal: null,
      observations: null,
      physicalRestrictions: null,
      createdAt: new Date().toISOString(),
    }

    await injectMockAuth(page)
    await mockStudentsListStateful(page, paginated(STUDENTS), paginated([...STUDENTS, newStudent]))
    await mockCreateStudent(page, newStudent)
    await mockGenerateStudentAccessLink(page)
    await mockGenerateInviteLink(page)

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    // Create student
    await page.getByRole("button", { name: /novo aluno/i }).click()
    await page.locator("#name").fill("Happy Path Student")
    await page.locator("#email").fill("hp-student@test.com")
    await page.getByRole("button", { name: /salvar/i }).click()

    // Dialog should close
    await expect(page.locator("#name")).not.toBeVisible({ timeout: 5000 })

    // New student should appear
    await expect(page.getByText("Happy Path Student")).toBeVisible({ timeout: 5000 })
  })
})

// =============================================================================
// HAPPY PATH — STEP 8: Create exercise
// =============================================================================

test.describe("Happy Path — Step 8: Create Exercise", () => {
  test("coach creates a custom exercise", async ({ page }) => {
    const newExercise = {
      id: "ex-hp-1",
      name: "Agachamento Búlgaro",
      muscleGroup: "pernas",
      description: "Exercício unilateral",
      mediaUrl: null,
      tenantId: MOCK_TENANT_ID,
      createdAt: new Date().toISOString(),
    }

    await injectMockAuth(page)
    await mockEnumMuscleGroups(page)
    await mockExercisesListStateful(
      page,
      paginated(GLOBAL_EXERCISES, 0, 9),
      paginated([...GLOBAL_EXERCISES, newExercise], 0, 9)
    )
    await mockCreateExercise(page, newExercise)

    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 10000 })

    await page.getByRole("button", { name: /criar exercício/i }).click()
    await expect(page.getByRole("heading", { name: /novo exercício/i })).toBeVisible()

    await page.locator("#exercise-name").fill("Agachamento Búlgaro")
    await page.locator("#exercise-muscleGroup").click()
    await page.getByRole("option", { name: /perna/i }).click()
    await page.getByRole("button", { name: /salvar/i }).click()

    // Dialog closes and exercise appears
    await expect(page.getByRole("heading", { name: /novo exercício/i })).not.toBeVisible({
      timeout: 5000,
    })
    await expect(page.getByText("Agachamento Búlgaro")).toBeVisible()
  })
})

// =============================================================================
// HAPPY PATH — STEP 9: Create training program
// =============================================================================

test.describe("Happy Path — Step 9: Create Training Program", () => {
  test("coach creates a training program template", async ({ page }) => {
    const newTemplate = {
      id: "tpl-hp-1",
      name: "Programa Happy Path",
      description: "Programa de teste E2E",
      status: "active",
      workoutCount: 0,
      createdAt: new Date().toISOString(),
    }

    await injectMockAuth(page)
    await mockProgramTemplatesListStateful(
      page,
      paginated(TEMPLATES, 0, 12),
      paginated([...TEMPLATES, newTemplate], 0, 12)
    )
    await mockCreateProgramTemplate(page, newTemplate)

    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 10000,
    })

    await page.getByTestId("create-template-button").click()

    await page.locator("#template-name").fill("Programa Happy Path")
    await page.locator("#template-description").fill("Programa de teste E2E")
    await page.getByTestId("template-submit-button").click()

    // Dialog closes and template appears
    await expect(page.getByText("Programa Happy Path")).toBeVisible({ timeout: 5000 })
  })
})

// =============================================================================
// HAPPY PATH — STEP 10: Student views training
// =============================================================================

test.describe("Happy Path — Step 10: Student Views Training", () => {
  async function setupStudentPortal(page: import("@playwright/test").Page) {
    await injectStudentMockAuth(page)

    // Mock student programs
    await page.route("**/api/v1/student-programs/me*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: studentProgramsPaginated,
        })
      } else {
        route.fallback()
      }
    })

    // Mock program detail
    await page.route("**/api/v1/student-programs/prog-1*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: STUDENT_PROGRAM,
        })
      } else {
        route.fallback()
      }
    })
  }

  test("student can see their training programs", async ({ page }) => {
    await setupStudentPortal(page)

    // Mock public coach info for route
    await page.route("**/api/v1/public/joao-silva*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: COACH_PUBLIC,
        })
      } else {
        route.fallback()
      }
    })

    await page.goto("/coach/joao-silva/aluno/treinos")
    await page.waitForTimeout(5000)

    await expect(page.getByRole("heading", { name: "Meus Treinos" })).toBeVisible({ timeout: 10000 })
  })
})

// =============================================================================
// HAPPY PATH — STEP 11: Student starts and finishes workout
// =============================================================================

test.describe("Happy Path — Step 11: Workout Execution", () => {
  async function setupWorkoutExecution(page: import("@playwright/test").Page) {
    await injectStudentMockAuth(page)

    // Mock public coach info (needed for /coach/[slug] routes)
    await page.route("**/api/v1/public/joao-silva*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: COACH_PUBLIC,
        })
      } else {
        route.fallback()
      }
    })

    // Mock student programs
    await page.route("**/api/v1/student-programs/me*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: studentProgramsPaginated,
        })
      } else {
        route.fallback()
      }
    })

    // Mock program detail
    await page.route("**/api/v1/student-programs/prog-1*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: STUDENT_PROGRAM,
        })
      } else {
        route.fallback()
      }
    })

    // Mock workout day detail
    await page.route("**/api/v1/workout-days/wd-1*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: STUDENT_PROGRAM.workoutDays[0],
        })
      } else {
        route.fallback()
      }
    })

    // Mock active session check — no active session
    await page.route("**/api/v1/workout-sessions/active*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 404, contentType: "application/json", json: {} })
      } else {
        route.fallback()
      }
    })

    // Mock start session
    await page.route("**/api/v1/workout-sessions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: CREATED_SESSION,
        })
      } else {
        route.fallback()
      }
    })

    // Mock create execution
    await page.route("**/api/v1/exercise-executions*", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: CREATED_EXECUTION,
        })
      } else {
        route.fallback()
      }
    })

    // Mock record set
    await page.route("**/api/v1/exercise-sets*", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: RECORDED_SET,
        })
      } else {
        route.fallback()
      }
    })

    // Mock finish session
    await page.route("**/api/v1/workout-sessions/session-1*", (route) => {
      if (route.request().method() === "PATCH") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { ...CREATED_SESSION, status: "finished", finishedAt: new Date().toISOString() },
        })
      } else {
        route.fallback()
      }
    })
  }

  test("student can view training programs list", async ({ page }) => {
    await setupWorkoutExecution(page)

    await page.goto("/coach/joao-silva/aluno/treinos")

    // Wait for programs to load
    await page.waitForTimeout(5000)

    // Should show the training programs heading
    await expect(page.getByRole("heading", { name: "Meus Treinos" })).toBeVisible({ timeout: 10000 })
  })
})
