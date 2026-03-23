import { test, expect } from "@playwright/test"
import { injectStudentMockAuth } from "../support/apiMocks"
import {
  MOCK_PROGRAM_ID,
  MOCK_WORKOUT_DAY_ID,
  activePrograms,
  programDetail,
  createdSession,
  createdExecution,
  recordedSet,
} from "../fixtures/studentWorkout.fixtures"

const TREINOS_URL = "/aluno/treinos"
const EXECUTAR_URL = `/aluno/treinos/${MOCK_PROGRAM_ID}/${MOCK_WORKOUT_DAY_ID}/executar`

async function mockWorkoutCore(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/student-programs/me*", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: activePrograms })
    } else {
      route.fallback()
    }
  })

  await page.route(`**/api/v1/student-programs/${MOCK_PROGRAM_ID}*`, (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: programDetail })
    } else {
      route.fallback()
    }
  })

  await page.route("**/api/v1/workout-sessions", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: createdSession })
    } else {
      route.fallback()
    }
  })

  await page.route("**/api/v1/exercise-executions", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: createdExecution })
    } else {
      route.fallback()
    }
  })

  await page.route("**/api/v1/exercise-sets", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 201, contentType: "application/json", json: recordedSet })
    } else {
      route.fallback()
    }
  })
}

test.describe("Core E2E — Student critical flow", () => {
  test("student acessa treinos e inicia uma execução", async ({ page }) => {
    await injectStudentMockAuth(page)
    await mockWorkoutCore(page)

    await page.goto(TREINOS_URL)
    await page.waitForSelector("[data-testid='programs-list']", { timeout: 8000 })
    await expect(page.getByTestId("program-card")).toBeVisible()

    await page.getByTestId("workout-day-link").first().click()
    await expect(page).toHaveURL(new RegExp(EXECUTAR_URL))

    await page.getByTestId("start-workout-button").click()
    await page.waitForSelector("[data-testid='exercise-list']", { timeout: 8000 })
    await expect(page.getByTestId("exercise-list-item")).toHaveCount(2)

    await page.getByTestId("exercise-list-item").first().click()
    await page.waitForSelector("[data-testid='active-exercise-view']", { timeout: 8000 })
    await expect(page.getByText("Agachamento")).toBeVisible()
    await expect(page.getByText(/Série 1\/3|1\/3/)).toBeVisible()
  })
})
