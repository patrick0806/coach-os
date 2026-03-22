/**
 * Progress Chart — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 */
import { test, expect } from "@playwright/test"
import { injectMockAuth, mockGet } from "../support/apiMocks"
import {
  MOCK_STUDENT_ID,
  MOCK_WEIGHT_CHART_DATA,
  MOCK_BODY_FAT_CHART_DATA,
  MOCK_EMPTY_CHART_DATA,
  MOCK_ALL_METRICS_CHART_DATA,
} from "../fixtures/progressChart.fixtures"
import { progressCheckinsFixtures } from "../fixtures/progressCheckins.fixtures"

const STUDENT_URL = `/students/${MOCK_STUDENT_ID}`
const API_STUDENT = `**/api/v1/students/${MOCK_STUDENT_ID}`
const API_CHECKINS = `**/api/v1/students/${MOCK_STUDENT_ID}/progress-checkins*`
const API_CHART = `**/api/v1/students/${MOCK_STUDENT_ID}/progress-records/chart*`

const mockStudent = {
  id: MOCK_STUDENT_ID,
  name: "João Silva",
  email: "joao@test.com",
  phoneNumber: null,
  goal: null,
  observations: null,
  physicalRestrictions: null,
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
}

const emptyPaginated = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
}

async function setupPage(page: import("@playwright/test").Page) {
  await injectMockAuth(page)
  await mockGet(page, API_STUDENT, mockStudent)
  await mockGet(page, API_CHECKINS, progressCheckinsFixtures.withCheckins)
  await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/notes*`, emptyPaginated)
  await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/programs*`, emptyPaginated)
  await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules*`, [])
  await mockGet(page, `**/api/v1/appointments*`, emptyPaginated)
}

async function setupChartRoute(page: import("@playwright/test").Page) {
  await page.route(API_CHART, (route) => {
    const url = new URL(route.request().url())
    const metricType = url.searchParams.get("metricType")

    if (!metricType) {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: MOCK_ALL_METRICS_CHART_DATA,
      })
    } else if (metricType === "weight") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: MOCK_WEIGHT_CHART_DATA,
      })
    } else if (metricType === "body_fat") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: MOCK_BODY_FAT_CHART_DATA,
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: MOCK_EMPTY_CHART_DATA,
      })
    }
  })
}

async function navigateToEvolution(page: import("@playwright/test").Page) {
  const tab = page.getByRole("tab", { name: /evolu/i })
  await tab.waitFor({ state: "visible", timeout: 8000 })
  await tab.click()
  await page.waitForSelector("[data-testid='student-progress-section']", {
    timeout: 8000,
  })
}

// =============================================================================
// Combined chart (Todos)
// =============================================================================

test.describe("Progress Chart — Combined View", () => {
  test("combined chart appears when 'Todos' is selected (default)", async ({ page }) => {
    await setupPage(page)
    await setupChartRoute(page)
    await page.goto(STUDENT_URL)
    await navigateToEvolution(page)

    await expect(page.getByTestId("combined-progress-chart")).toBeVisible()
  })

  test("combined chart shows mini-charts for each metric", async ({ page }) => {
    await setupPage(page)
    await setupChartRoute(page)
    await page.goto(STUDENT_URL)
    await navigateToEvolution(page)

    await expect(page.getByTestId("metric-chart-weight")).toBeVisible()
    await expect(page.getByTestId("metric-chart-body_fat")).toBeVisible()
    await expect(page.getByTestId("metric-chart-waist")).toBeVisible()
  })

  test("combined chart shows empty state when no data", async ({ page }) => {
    await setupPage(page)
    await mockGet(page, API_CHART, MOCK_EMPTY_CHART_DATA)
    await page.goto(STUDENT_URL)
    await navigateToEvolution(page)

    await expect(page.getByTestId("combined-progress-chart")).toBeVisible()
    await expect(page.getByText("Sem dados para o gráfico")).toBeVisible()
  })
})

// =============================================================================
// Single metric chart
// =============================================================================

test.describe("Progress Chart — Single Metric", () => {
  test("single chart appears when a specific metric is selected", async ({ page }) => {
    await setupPage(page)
    await setupChartRoute(page)
    await page.goto(STUDENT_URL)
    await navigateToEvolution(page)

    await page.getByRole("button", { name: "Peso" }).click()

    await expect(page.getByTestId("progress-chart")).toBeVisible()
    await expect(page.getByTestId("combined-progress-chart")).not.toBeVisible()
  })

  test("switching back to 'Todos' shows combined chart", async ({ page }) => {
    await setupPage(page)
    await setupChartRoute(page)
    await page.goto(STUDENT_URL)
    await navigateToEvolution(page)

    await page.getByRole("button", { name: "Peso" }).click()
    await expect(page.getByTestId("progress-chart")).toBeVisible()

    await page.getByRole("button", { name: "Todos" }).click()
    await expect(page.getByTestId("combined-progress-chart")).toBeVisible()
    await expect(page.getByTestId("progress-chart")).not.toBeVisible()
  })
})

// =============================================================================
// Empty state
// =============================================================================

test.describe("Progress Chart — Empty State", () => {
  test("shows empty chart message when no data for metric", async ({ page }) => {
    await setupPage(page)
    await setupChartRoute(page)
    await page.goto(STUDENT_URL)
    await navigateToEvolution(page)

    await page.getByRole("button", { name: "Cintura" }).click()

    await expect(page.getByTestId("progress-chart")).toBeVisible()
    await expect(page.getByText("Sem dados para o gráfico")).toBeVisible()
  })
})

// =============================================================================
// Metric switching
// =============================================================================

test.describe("Progress Chart — Metric Switching", () => {
  test("metric selector buttons switch chart data", async ({ page }) => {
    await setupPage(page)
    await setupChartRoute(page)
    await page.goto(STUDENT_URL)
    await navigateToEvolution(page)

    // Select weight
    await page.getByRole("button", { name: "Peso" }).click()
    await expect(page.getByTestId("progress-chart")).toBeVisible()
    await expect(page.getByText("Peso (kg)")).toBeVisible()

    // Switch to body fat
    await page.getByRole("button", { name: "% Gordura" }).click()
    await expect(page.getByText("% Gordura (%)")).toBeVisible()
  })
})
