import { test, expect } from "@playwright/test"
import {
  MOCK_STUDENT_USER,
  MOCK_PROGRAM_ID,
  MOCK_WORKOUT_DAY_ID,
  activePrograms,
  emptyPrograms,
  programDetail,
  createdSession,
  createdExecution,
  recordedSet,
} from "../fixtures/studentWorkout.fixtures"
import { injectStudentMockAuth } from "../support/apiMocks"

const STUDENT_ID = MOCK_STUDENT_USER.id
const TREINOS_URL = "/aluno/treinos"
const EXECUTAR_URL = `/aluno/treinos/${MOCK_PROGRAM_ID}/${MOCK_WORKOUT_DAY_ID}/executar`

test.describe("Student workout portal — behavioral", () => {
  test.beforeEach(async ({ page }) => {
    await injectStudentMockAuth(page)
  })

  // ==========================================================================
  // Programs list page
  // ==========================================================================

  test("shows list of active programs with workout day links", async ({ page }) => {
    await page.route(`**/api/v1/students/${STUDENT_ID}/programs*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: activePrograms })
      } else {
        route.continue()
      }
    })

    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: { data: programDetail } })
      } else {
        route.continue()
      }
    })

    await page.goto(TREINOS_URL)

    await expect(page.getByTestId("programs-list")).toBeVisible()
    await expect(page.getByTestId("program-card")).toBeVisible()
    await expect(page.getByTestId("workout-day-link")).toHaveCount(1) // 1 workout day in fixture
  })

  test("shows empty state when no active programs", async ({ page }) => {
    await page.route(`**/api/v1/students/${STUDENT_ID}/programs*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: emptyPrograms })
      } else {
        route.continue()
      }
    })

    await page.goto(TREINOS_URL)

    await expect(page.getByText("Nenhum programa ativo", { exact: false })).toBeVisible()
  })

  test("workout day link navigates to execution page", async ({ page }) => {
    await page.route(`**/api/v1/students/${STUDENT_ID}/programs*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: activePrograms })
      } else {
        route.continue()
      }
    })

    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: { data: programDetail } })
      } else {
        route.continue()
      }
    })

    await page.goto(TREINOS_URL)

    // Click the first workout day link
    await page.getByTestId("workout-day-link").first().click()

    await expect(page).toHaveURL(new RegExp(`/aluno/treinos/${MOCK_PROGRAM_ID}/${MOCK_WORKOUT_DAY_ID}/executar`))
  })

  // ==========================================================================
  // Execution page — idle state
  // ==========================================================================

  test("idle execution page shows exercises and start button", async ({ page }) => {
    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: { data: programDetail } })
      } else {
        route.continue()
      }
    })

    await page.goto(EXECUTAR_URL)

    await expect(page.getByTestId("exercises-preview")).toBeVisible()
    await expect(page.getByTestId("exercise-preview-item")).toHaveCount(2)
    await expect(page.getByTestId("start-workout-button")).toBeVisible()
    await expect(page.getByText("Iniciar Treino")).toBeVisible()
  })

  test("start workout calls POST /workout-sessions", async ({ page }) => {
    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: { data: programDetail } })
      } else {
        route.continue()
      }
    })

    let startSessionCalled = false
    await page.route("**/api/v1/workout-sessions", (route) => {
      if (route.request().method() === "POST") {
        startSessionCalled = true
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: { data: createdSession },
        })
      } else {
        route.continue()
      }
    })

    await page.goto(EXECUTAR_URL)
    await page.getByTestId("start-workout-button").click()

    await expect(page.getByTestId("exercises-execution")).toBeVisible()
    expect(startSessionCalled).toBe(true)
  })

  test("exercise card opens and creates execution on expand", async ({ page }) => {
    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: { data: programDetail } })
      } else {
        route.continue()
      }
    })

    await page.route("**/api/v1/workout-sessions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 201, contentType: "application/json", json: { data: createdSession } })
      } else {
        route.continue()
      }
    })

    let executionCreated = false
    await page.route("**/api/v1/exercise-executions", (route) => {
      if (route.request().method() === "POST") {
        executionCreated = true
        route.fulfill({ status: 201, contentType: "application/json", json: { data: createdExecution } })
      } else {
        route.continue()
      }
    })

    await page.goto(EXECUTAR_URL)
    await page.getByTestId("start-workout-button").click()

    // Click the first exercise card to open it
    await page.getByTestId("exercise-execution-card").first().locator("button").first().click()

    await expect(page.locator("[data-testid='set-row-1']")).toBeVisible()
    expect(executionCreated).toBe(true)
  })

  test("record set calls POST /exercise-sets", async ({ page }) => {
    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: { data: programDetail } })
      } else {
        route.continue()
      }
    })

    await page.route("**/api/v1/workout-sessions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 201, contentType: "application/json", json: { data: createdSession } })
      } else {
        route.continue()
      }
    })

    await page.route("**/api/v1/exercise-executions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 201, contentType: "application/json", json: { data: createdExecution } })
      } else {
        route.continue()
      }
    })

    let setRecorded = false
    await page.route("**/api/v1/exercise-sets", (route) => {
      if (route.request().method() === "POST") {
        setRecorded = true
        route.fulfill({ status: 201, contentType: "application/json", json: { data: recordedSet } })
      } else {
        route.continue()
      }
    })

    await page.goto(EXECUTAR_URL)
    await page.getByTestId("start-workout-button").click()

    // Open first exercise card
    await page.getByTestId("exercise-execution-card").first().locator("button").first().click()

    // Complete set 1
    await page.getByTestId("complete-set-1").click()

    expect(setRecorded).toBe(true)
  })

  test("finish workout shows completion screen", async ({ page }) => {
    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: { data: programDetail } })
      } else {
        route.continue()
      }
    })

    await page.route("**/api/v1/workout-sessions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 201, contentType: "application/json", json: { data: createdSession } })
      } else {
        route.continue()
      }
    })

    await page.route(`**/api/v1/workout-sessions/${createdSession.id}/finish*`, (route) => {
      if (route.request().method() === "PATCH") {
        route.fulfill({ status: 200, contentType: "application/json", json: {} })
      } else {
        route.continue()
      }
    })

    await page.goto(EXECUTAR_URL)
    await page.getByTestId("start-workout-button").click()

    // Click finish
    await page.getByTestId("finish-workout-button").click()

    await expect(page.getByTestId("completion-screen")).toBeVisible()
    await expect(page.getByText("Treino concluído!", { exact: false })).toBeVisible()
  })

  // ==========================================================================
  // Mobile layout
  // ==========================================================================

  test("renders correctly on mobile viewport (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await page.route(`**/api/v1/students/${STUDENT_ID}/programs*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: activePrograms })
      } else {
        route.continue()
      }
    })

    await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 200, contentType: "application/json", json: { data: programDetail } })
      } else {
        route.continue()
      }
    })

    await page.goto(TREINOS_URL)

    await expect(page.getByTestId("programs-list")).toBeVisible()
    await expect(page.getByTestId("program-card")).toBeVisible()
  })
})
