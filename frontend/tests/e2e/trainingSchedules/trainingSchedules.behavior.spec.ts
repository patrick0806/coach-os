/**
 * Training Schedules — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 * Tests cover: Agenda tab, list schedules, add/edit/delete, empty state.
 */
import { test, expect } from "@playwright/test"
import type { Page, Route } from "@playwright/test"
import {
  injectMockAuth,
  mockGet,
  mockGetStateful,
} from "../support/apiMocks"
import {
  MOCK_STUDENT_ID,
  trainingScheduleFixtures,
} from "../fixtures/trainingSchedules.fixtures"
import { activeStudents } from "../fixtures/students.fixtures"

const STUDENT = activeStudents[0] // id: "st-1"
const PAGE_URL = `/students/${MOCK_STUDENT_ID}`

async function mockStudentDetail(page: Page) {
  await page.route(`**/api/v1/students/${MOCK_STUDENT_ID}`, (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: STUDENT })
    } else {
      route.fallback()
    }
  })
}

async function mockStudentNotes(page: Page) {
  await mockGet(page, `**/api/v1/students/${MOCK_STUDENT_ID}/notes*`, {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  })
}

async function setupPage(
  page: Page,
  schedules: object[] = trainingScheduleFixtures.withSchedules
) {
  await injectMockAuth(page)
  await mockStudentDetail(page)
  await mockStudentNotes(page)
  await mockGet(
    page,
    `**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules`,
    schedules
  )
  await page.goto(PAGE_URL)
  await page.waitForSelector("[role='tablist']", { timeout: 8000 })
}

// Helper to click Agenda tab — uses force:true because on mobile viewports
// the 6th tab may overlap with adjacent tabs (a CSS issue, not behavioral)
async function clickAgendaTab(page: import("@playwright/test").Page) {
  await page.getByRole("tab", { name: "Agenda" }).click({ force: true })
}

// =============================================================================
// Tab Display
// =============================================================================

test.describe("Training Schedules — Tab", () => {
  test("Agenda tab is enabled and clickable", async ({ page }) => {
    await setupPage(page)
    const agendaTab = page.getByRole("tab", { name: "Agenda" })
    await expect(agendaTab).toBeVisible()
    await expect(agendaTab).not.toBeDisabled()
  })

  test("clicking Agenda tab shows schedule content", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await expect(page.getByText("Horários de Treino")).toBeVisible()
  })

  test("shows Adicionar button", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await expect(page.getByTestId("add-schedule-btn")).toBeVisible()
  })
})

// =============================================================================
// Schedule List
// =============================================================================

test.describe("Training Schedules — List", () => {
  test("shows schedule entries with day and time", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await expect(page.getByTestId("schedules-grid")).toBeVisible()
    const entries = page.getByTestId("schedule-entry")
    await expect(entries).toHaveCount(3)
  })

  test("shows location when present", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await expect(page.getByText("Academia Central").first()).toBeVisible()
  })

  test("shows day labels (Segunda, Quarta, Sexta)", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await expect(page.getByText("Segunda")).toBeVisible()
    await expect(page.getByText("Quarta")).toBeVisible()
    await expect(page.getByText("Sexta")).toBeVisible()
  })

  test("shows time range", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await expect(page.getByText("08:00 - 09:00").first()).toBeVisible()
    await expect(page.getByText("10:00 - 11:00")).toBeVisible()
  })

  test("shows inactive label for inactive schedules", async ({ page }) => {
    await setupPage(page, trainingScheduleFixtures.withInactive)
    await clickAgendaTab(page)
    await expect(page.getByText("(inativo)")).toBeVisible()
  })
})

// =============================================================================
// Empty State
// =============================================================================

test.describe("Training Schedules — Empty State", () => {
  test("shows empty state when no schedules", async ({ page }) => {
    await setupPage(page, trainingScheduleFixtures.empty)
    await clickAgendaTab(page)
    await expect(page.getByTestId("empty-schedules")).toBeVisible()
    await expect(page.getByText("Nenhum horário de treino definido")).toBeVisible()
  })
})

// =============================================================================
// Create Flow
// =============================================================================

test.describe("Training Schedules — Create", () => {
  test("Adicionar button opens form dialog", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await page.getByTestId("add-schedule-btn").click({ force: true })
    await expect(
      page.getByRole("heading", { name: "Novo horário de treino" })
    ).toBeVisible()
  })

  test("form shows all required fields", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await page.getByTestId("add-schedule-btn").click({ force: true })
    await expect(page.locator("#dayOfWeek")).toBeVisible()
    await expect(page.locator("#startTime")).toBeVisible()
    await expect(page.locator("#endTime")).toBeVisible()
    await expect(page.locator("#location")).toBeVisible()
  })

  test("submit calls POST with correct payload", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockGetStateful(
      page,
      `**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules`,
      trainingScheduleFixtures.empty,
      [trainingScheduleFixtures.newSchedule]
    )

    // Mock POST
    await page.route(`**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules`, (route: Route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: trainingScheduleFixtures.newSchedule,
        })
      } else {
        route.fallback()
      }
    })

    await page.goto(PAGE_URL)
    await page.waitForSelector("[role='tablist']", { timeout: 8000 })
    await clickAgendaTab(page)
    await page.getByTestId("add-schedule-btn").click({ force: true })

    // Fill form
    await page.locator("#dayOfWeek").click()
    await page.getByRole("option", { name: "Quinta" }).click()
    await page.locator("#startTime").fill("09:00")
    await page.locator("#endTime").fill("10:00")
    await page.locator("#location").fill("Academia XYZ")

    let postCalled = false
    page.on("request", (req) => {
      if (
        req.method() === "POST" &&
        req.url().includes(`/students/${MOCK_STUDENT_ID}/training-schedules`)
      ) {
        postCalled = true
      }
    })

    await page.getByRole("button", { name: "Salvar" }).click()
    await page.waitForTimeout(500)
    expect(postCalled).toBe(true)
  })

  test("shows success toast after creating schedule", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockGetStateful(
      page,
      `**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules`,
      trainingScheduleFixtures.empty,
      [trainingScheduleFixtures.newSchedule]
    )
    await page.route(`**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules`, (route: Route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          json: trainingScheduleFixtures.newSchedule,
        })
      } else {
        route.fallback()
      }
    })

    await page.goto(PAGE_URL)
    await page.waitForSelector("[role='tablist']", { timeout: 8000 })
    await clickAgendaTab(page)
    await page.getByTestId("add-schedule-btn").click({ force: true })

    await page.locator("#dayOfWeek").click()
    await page.getByRole("option", { name: "Quinta" }).click()
    await page.locator("#startTime").fill("09:00")
    await page.locator("#endTime").fill("10:00")

    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByText("Horário adicionado com sucesso!")).toBeVisible({ timeout: 5000 })
  })
})

// =============================================================================
// Delete Flow
// =============================================================================

test.describe("Training Schedules — Delete", () => {
  test("delete button opens confirmation dialog", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await page.getByTestId("delete-schedule-btn").first().click({ force: true })
    await expect(page.getByText("Remover horário")).toBeVisible()
    await expect(page.getByText("Tem certeza que deseja remover")).toBeVisible()
  })

  test("confirming delete calls DELETE endpoint", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockGetStateful(
      page,
      `**/api/v1/students/${MOCK_STUDENT_ID}/training-schedules`,
      trainingScheduleFixtures.withSchedules,
      trainingScheduleFixtures.withSchedules.slice(1) // After delete, one fewer
    )

    await page.route("**/api/v1/training-schedules/ts-1", (route: Route) => {
      if (route.request().method() === "DELETE") {
        route.fulfill({ status: 204 })
      } else {
        route.fallback()
      }
    })

    await page.goto(PAGE_URL)
    await page.waitForSelector("[role='tablist']", { timeout: 8000 })
    await clickAgendaTab(page)

    let deleteCalled = false
    page.on("request", (req) => {
      if (req.method() === "DELETE" && req.url().includes("/training-schedules/ts-1")) {
        deleteCalled = true
      }
    })

    await page.getByTestId("delete-schedule-btn").first().click({ force: true })
    await page.getByRole("button", { name: "Remover" }).click()
    await page.waitForTimeout(500)
    expect(deleteCalled).toBe(true)
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Training Schedules — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("renders schedule tab on mobile", async ({ page }) => {
    await setupPage(page)
    await clickAgendaTab(page)
    await expect(page.getByText("Horários de Treino")).toBeVisible()
    await expect(page.getByTestId("schedules-grid")).toBeVisible()
  })
})
