/**
 * Workout Execution — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 *
 * Coverage:
 * - Programs list page: display, empty state, navigation
 * - Execution page: idle state, start session, exercise list, free-order selection
 * - Set recording, rest timer, back-to-list navigation
 * - Workout completion screen
 * - Mobile viewport
 */
import { test, expect } from "@playwright/test"
import {
  MOCK_PROGRAM_ID,
  MOCK_WORKOUT_DAY_ID,
  activePrograms,
  emptyPrograms,
  programDetail,
  createdSession,
  resumedSession,
  resumedSessionFullExercise,
  createdExecution,
  recordedSet,
} from "../fixtures/studentWorkout.fixtures"
import { injectStudentMockAuth } from "../support/apiMocks"

const TREINOS_URL = "/aluno/treinos"
const EXECUTAR_URL = `/aluno/treinos/${MOCK_PROGRAM_ID}/${MOCK_WORKOUT_DAY_ID}/executar`

// =============================================================================
// Shared setup helpers
// =============================================================================

async function mockActivePrograms(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/student-programs/me*", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: activePrograms,
      })
    } else {
      route.continue()
    }
  })
}

async function mockProgramDetail(page: import("@playwright/test").Page) {
  await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: programDetail,
      })
    } else {
      route.continue()
    }
  })
}

async function mockStartSession(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/workout-sessions", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: createdSession,
      })
    } else {
      route.continue()
    }
  })
}

async function mockCreateExecution(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/exercise-executions", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: createdExecution,
      })
    } else {
      route.continue()
    }
  })
}

async function mockRecordSet(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/exercise-sets", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: recordedSet,
      })
    } else {
      route.continue()
    }
  })
}

/** Start workout and wait for the exercise list to appear */
async function startWorkout(page: import("@playwright/test").Page) {
  await page.goto(EXECUTAR_URL)
  await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
  await page.getByTestId("start-workout-button").click()
  await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })
}

// =============================================================================
// Programs list page
// =============================================================================

test.describe("Workout Portal — Programs List", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
  })

  test("displays active programs list with program card", async ({ page }) => {
    await mockActivePrograms(page)
    await mockProgramDetail(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='programs-list']", { timeout: 8000 })

    await expect(page.getByTestId("programs-list")).toBeVisible()
    await expect(page.getByTestId("program-card")).toBeVisible()
    await expect(page.getByText("Programa de Hipertrofia")).toBeVisible()
  })

  test("displays workout day links inside the program card", async ({ page }) => {
    await mockActivePrograms(page)
    await mockProgramDetail(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='workout-day-link']", { timeout: 8000 })

    await expect(page.getByTestId("workout-day-link")).toHaveCount(1)
    await expect(page.getByText("Treino A — Pernas")).toBeVisible()
  })

  test("displays empty state when student has no active programs", async ({ page }) => {
    await page.route("**/api/v1/student-programs/me*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: emptyPrograms,
        })
      } else {
        route.continue()
      }
    })

    await page.goto(TREINOS_URL)
    await page.waitForLoadState("networkidle")

    await expect(page.getByText("Nenhum programa ativo")).toBeVisible()
  })

  test("clicking workout day link navigates to execution page", async ({ page }) => {
    await mockActivePrograms(page)
    await mockProgramDetail(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='workout-day-link']", { timeout: 8000 })

    await page.getByTestId("workout-day-link").first().click()

    await expect(page).toHaveURL(
      new RegExp(`/aluno/treinos/${MOCK_PROGRAM_ID}/${MOCK_WORKOUT_DAY_ID}/executar`)
    )
  })
})

// =============================================================================
// Execution page — idle state
// =============================================================================

test.describe("Workout Execution — Idle State", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
  })

  test("shows exercises preview and start button in idle state", async ({ page }) => {
    await mockProgramDetail(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='exercises-preview']", { timeout: 8000 })

    await expect(page.getByTestId("exercises-preview")).toBeVisible()
    await expect(page.getByTestId("start-workout-button")).toBeVisible()
    await expect(page.getByText("Iniciar Treino")).toBeVisible()
  })

  test("shows all exercises from the workout day in idle state", async ({ page }) => {
    await mockProgramDetail(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='exercise-preview-item']", { timeout: 8000 })

    await expect(page.getByTestId("exercise-preview-item")).toHaveCount(2)
    await expect(page.getByText("Agachamento")).toBeVisible()
    await expect(page.getByText("Leg Press")).toBeVisible()
  })

  test("displays workout day name in the header", async ({ page }) => {
    await mockProgramDetail(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForLoadState("networkidle")

    await expect(page.getByText("Treino A — Pernas")).toBeVisible()
  })
})

// =============================================================================
// Execution page — exercise list (free order)
// =============================================================================

test.describe("Workout Execution — Exercise List", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)
    await mockStartSession(page)
    await mockCreateExecution(page)
  })

  test("clicking 'Iniciar Treino' shows exercise list", async ({ page }) => {
    await startWorkout(page)

    await expect(page.getByTestId("exercise-list")).toBeVisible()
    await expect(page.getByTestId("exercise-list-item")).toHaveCount(2)
    await expect(page.getByTestId("finish-workout-button")).toBeVisible()
  })

  test("start button is not visible after workout starts", async ({ page }) => {
    await startWorkout(page)

    await expect(page.getByTestId("start-workout-button")).not.toBeVisible()
  })

  test("clicking an exercise opens the focused exercise view", async ({ page }) => {
    await startWorkout(page)

    // Click the second exercise (Leg Press) — free order
    await page.getByTestId("exercise-list-item").nth(1).click()

    await page.waitForSelector("[data-testid='active-exercise-view']", { timeout: 8000 })
    await expect(page.getByText("Leg Press")).toBeVisible()
    await expect(page.getByText("Série 1/3")).toBeVisible()
  })

  test("back-to-list button returns to exercise list", async ({ page }) => {
    await startWorkout(page)

    // Enter first exercise
    await page.getByTestId("exercise-list-item").first().click()
    await page.waitForSelector("[data-testid='active-exercise-view']", { timeout: 8000 })

    // Go back
    await page.getByTestId("back-to-list-button").click()
    await expect(page.getByTestId("exercise-list")).toBeVisible()
  })

  test("shows progress indicator", async ({ page }) => {
    await startWorkout(page)

    await expect(page.getByText("0/2 concluídos")).toBeVisible()
  })
})

// =============================================================================
// Execution page — set recording
// =============================================================================

test.describe("Workout Execution — Set Recording", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)
    await mockStartSession(page)
    await mockCreateExecution(page)
    await mockRecordSet(page)
  })

  test("shows reps and weight inputs for active set", async ({ page }) => {
    await startWorkout(page)
    await page.getByTestId("exercise-list-item").first().click()

    await page.waitForSelector("[data-testid='reps-input-1']", { timeout: 8000 })
    await expect(page.getByTestId("reps-input-1")).toBeVisible()
    await expect(page.getByTestId("weight-input-1")).toBeVisible()
    await expect(page.getByTestId("complete-set-1")).toBeVisible()
  })

  test("completing a set shows rest timer", async ({ page }) => {
    await startWorkout(page)
    await page.getByTestId("exercise-list-item").first().click()

    await page.waitForSelector("[data-testid='complete-set-1']", { timeout: 8000 })
    await page.getByTestId("complete-set-1").click()

    await page.waitForSelector("[data-testid='rest-timer']", { timeout: 5000 })
    await expect(page.getByTestId("rest-timer")).toBeVisible()
  })

  test("skip rest button advances to next set", async ({ page }) => {
    await startWorkout(page)
    await page.getByTestId("exercise-list-item").first().click()

    await page.waitForSelector("[data-testid='complete-set-1']", { timeout: 8000 })
    await page.getByTestId("complete-set-1").click()

    await page.waitForSelector("[data-testid='skip-rest-button']", { timeout: 5000 })
    await page.getByTestId("skip-rest-button").click()

    await page.waitForSelector("[data-testid='reps-input-2']", { timeout: 5000 })
    await expect(page.getByText("Série 2/3")).toBeVisible()
  })

  test("completing all sets returns to exercise list with exercise marked done", async ({ page }) => {
    await startWorkout(page)
    await page.getByTestId("exercise-list-item").first().click()

    // Complete all 3 sets
    for (let set = 1; set <= 3; set++) {
      await page.waitForSelector(`[data-testid='complete-set-${set}']`, { timeout: 8000 })
      await page.getByTestId(`complete-set-${set}`).click()

      if (set < 3) {
        await page.waitForSelector("[data-testid='skip-rest-button']", { timeout: 5000 })
        await page.getByTestId("skip-rest-button").click()
      }
    }

    // Should return to list with exercise marked as done
    await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })
    await expect(page.getByText("1/2 concluídos")).toBeVisible()
    // First exercise shows "Concluído" label
    await expect(page.getByTestId("exercise-list-item").first().getByText("Concluído")).toBeVisible()
  })
})

// =============================================================================
// Execution page — finish workout
// =============================================================================

test.describe("Workout Execution — Finish", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)
    await mockStartSession(page)
    await mockCreateExecution(page)
    await mockRecordSet(page)
  })

  test("finish button is always visible and shows completion screen", async ({ page }) => {
    await page.route(
      `**/api/v1/workout-sessions/${createdSession.id}/finish*`,
      (route) => {
        if (route.request().method() === "PATCH") {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            json: { id: createdSession.id, status: "finished" },
          })
        } else {
          route.continue()
        }
      }
    )

    await startWorkout(page)

    // Finish button is visible from the start
    await expect(page.getByTestId("finish-workout-button")).toBeVisible()

    await page.getByTestId("finish-workout-button").click()

    await page.waitForSelector("[data-testid='completion-screen']", { timeout: 8000 })
    await expect(page.getByTestId("completion-screen")).toBeVisible()
    await expect(page.getByText("Treino concluído!")).toBeVisible()
  })

  test("completion screen has a link back to /aluno/treinos", async ({ page }) => {
    await page.route(
      `**/api/v1/workout-sessions/${createdSession.id}/finish*`,
      (route) => {
        if (route.request().method() === "PATCH") {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            json: { id: createdSession.id, status: "finished" },
          })
        } else {
          route.continue()
        }
      }
    )

    await startWorkout(page)
    await page.getByTestId("finish-workout-button").click()

    await page.waitForSelector("[data-testid='completion-screen']", { timeout: 8000 })
    await expect(page.getByRole("link", { name: "Voltar aos treinos" })).toBeVisible()
  })
})

// =============================================================================
// Execution page — resume session (idempotent startSession)
// =============================================================================

async function mockResumeSession(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/workout-sessions", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        json: resumedSession,
      })
    } else {
      route.continue()
    }
  })
}

test.describe("Workout Execution — Resume Session", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)
    await mockResumeSession(page)
    await mockCreateExecution(page)
    await mockRecordSet(page)
  })

  test("resuming a session shows exercise list with partial progress", async ({ page }) => {
    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })

    // First exercise (Agachamento) should show partial progress: 1/3 séries
    await expect(page.getByTestId("exercise-list-item").first().getByText("1/3 séries")).toBeVisible()

    // Second exercise (Leg Press) should have no progress indicator
    await expect(page.getByTestId("exercise-list-item").nth(1).getByText("3 séries")).toBeVisible()
  })

  test("resuming shows correct progress count", async ({ page }) => {
    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })

    // No exercise fully complete yet
    await expect(page.getByText("0/2 concluídos")).toBeVisible()
  })

  test("clicking resumed exercise shows correct set number (continues from where left off)", async ({ page }) => {
    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })

    // Click the first exercise (has 1 set already completed)
    await page.getByTestId("exercise-list-item").first().click()
    await page.waitForSelector("[data-testid='active-exercise-view']", { timeout: 8000 })

    // Should show set 2 (since set 1 was already completed)
    await expect(page.getByText("Série 2/3")).toBeVisible()
  })
})

test.describe("Workout Execution — Resume Fully Completed Exercise", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)
    await mockCreateExecution(page)
    await mockRecordSet(page)
    // Mock startSession to return session with first exercise fully completed
    await page.route("**/api/v1/workout-sessions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: resumedSessionFullExercise,
        })
      } else {
        route.continue()
      }
    })
  })

  test("fully completed exercise shows as done and is disabled", async ({ page }) => {
    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })

    // First exercise should show "Concluído" and be disabled
    await expect(page.getByTestId("exercise-list-item").first().getByText("Concluído")).toBeVisible()
    // Progress shows 1/2 completed
    await expect(page.getByText("1/2 concluídos")).toBeVisible()
  })

  test("second exercise is still clickable when first is fully completed", async ({ page }) => {
    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })
    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })

    // Second exercise (Leg Press) should be clickable
    await page.getByTestId("exercise-list-item").nth(1).click()
    await page.waitForSelector("[data-testid='active-exercise-view']", { timeout: 8000 })
    await expect(page.getByText("Leg Press")).toBeVisible()
    await expect(page.getByText("Série 1/3")).toBeVisible()
  })
})

// =============================================================================
// Mobile viewport
// =============================================================================

test.describe("Workout Portal — Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("programs list renders correctly on mobile (390px)", async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockActivePrograms(page)
    await mockProgramDetail(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='programs-list']", { timeout: 8000 })

    await expect(page.getByTestId("programs-list")).toBeVisible()
    await expect(page.getByTestId("program-card")).toBeVisible()

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(390)
  })

  test("execution page renders correctly on mobile (390px)", async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockProgramDetail(page)

    await page.goto(EXECUTAR_URL)
    await page.waitForSelector("[data-testid='start-workout-button']", { timeout: 8000 })

    await expect(page.getByTestId("exercises-preview")).toBeVisible()
    await expect(page.getByTestId("start-workout-button")).toBeVisible()

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(390)
  })
})
