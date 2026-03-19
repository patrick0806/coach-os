/**
 * Student Portal — Agenda Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 * Tests cover: weekly schedule grid, appointments list, empty states.
 */
import { test, expect } from "@playwright/test"
import {
  injectStudentMockAuth,
  mockStudentMyAppointments,
  mockStudentTrainingSchedules,
} from "../support/apiMocks"
import { studentAppointmentFixtures, studentScheduleFixtures } from "../fixtures/studentPortal.fixtures"

const PAGE_URL = "/aluno/agenda"

async function setupPage(
  page: import("@playwright/test").Page,
  appointments: object = studentAppointmentFixtures.scheduled,
  schedules: object[] = studentScheduleFixtures.withSchedules
) {
  await injectStudentMockAuth(page)
  await mockStudentMyAppointments(page, appointments)
  await mockStudentTrainingSchedules(page, schedules)
  await page.goto(PAGE_URL)
  await page.waitForSelector("[data-testid='agenda-page']", { timeout: 8000 })
}

// =============================================================================
// Load & Sections
// =============================================================================

test.describe("Student Agenda — Sections", () => {
  test("renders agenda card with header", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Sua agenda")).toBeVisible()
    await expect(page.getByText("Semana atual")).toBeVisible()
  })

  test("renders Próximas Aulas section", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByRole("heading", { name: "Próximas Aulas" })).toBeVisible()
  })
})

// =============================================================================
// Training Schedules — Weekly Grid
// =============================================================================

test.describe("Student Agenda — Weekly Grid", () => {
  test("renders weekly schedule view when schedules exist", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("weekly-schedule-view")).toBeVisible()
  })

  test("shows active day cells for training days", async ({ page }) => {
    await setupPage(page)
    // withSchedules has 3 active days (Mon=1, Wed=3, Fri=5)
    await expect(page.getByTestId("schedule-day-active")).toHaveCount(3)
  })

  test("shows free day cells for non-training days", async ({ page }) => {
    await setupPage(page)
    // 5 weekdays - 3 active = 2 free
    await expect(page.getByTestId("schedule-day-free")).toHaveCount(2)
  })

  test("shows day labels in Portuguese", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Seg")).toBeVisible()
    await expect(page.getByText("Qua")).toBeVisible()
    await expect(page.getByTestId("weekly-schedule-view").getByText("Sex")).toBeVisible()
  })

  test("shows time on active day cells", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("08:00").first()).toBeVisible()
  })

  test("shows training count badge", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("3 treinos")).toBeVisible()
  })

  test("shows empty message when no schedules", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.scheduled, studentScheduleFixtures.empty)
    await expect(page.getByText("Nenhum horário fixo configurado.")).toBeVisible()
  })

  test("renders single day schedule", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.empty, studentScheduleFixtures.singleDay)
    // singleDay has dayOfWeek=2 → Ter column should be active
    await expect(page.getByTestId("schedule-day-active")).toHaveCount(1)
    await expect(page.getByText("07:00")).toBeVisible()
  })
})

// =============================================================================
// Appointments
// =============================================================================

test.describe("Student Agenda — Próximas Aulas", () => {
  test("renders appointment items when appointments exist", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("appointment-item").first()).toBeVisible()
  })

  test("shows presential appointment location", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Academia Central")).toBeVisible()
  })

  test("shows appointment status Agendada", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Agendada")).toBeVisible()
  })

  test("shows online appointment with Online label", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.online)
    await expect(page.getByText("Online")).toBeVisible()
  })

  test("shows meeting link for scheduled online appointment", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.online)
    await expect(page.getByTestId("meeting-link")).toBeVisible()
    await expect(page.getByText("Entrar")).toBeVisible()
  })

  test("meeting link points to the correct URL", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.online)
    const href = await page.getByTestId("meeting-link").getAttribute("href")
    expect(href).toBe("https://meet.example.com/abc123")
  })

  test("shows multiple appointments", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.multiple)
    await expect(page.getByTestId("appointment-item")).toHaveCount(3)
  })

  test("shows Concluída for completed appointment", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.multiple)
    await expect(page.getByText("Concluída")).toBeVisible()
  })

  test("shows appointment time range", async ({ page }) => {
    await setupPage(page)
    // startAt: "2026-03-20T10:00:00Z" → "10:00 – 11:00" (UTC)
    const text = await page.getByTestId("appointment-item").first().textContent()
    expect(text).toMatch(/\d{2}:\d{2}\s*–\s*\d{2}:\d{2}/)
  })

  test("shows empty state when no appointments", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.empty, studentScheduleFixtures.empty)
    await expect(page.getByText("Nenhuma aula agendada")).toBeVisible()
    await expect(page.getByText(/próximos 30 dias/i)).toBeVisible()
  })
})

// =============================================================================
// Both Empty
// =============================================================================

test.describe("Student Agenda — All Empty", () => {
  test("shows both empty states when no data", async ({ page }) => {
    await setupPage(page, studentAppointmentFixtures.empty, studentScheduleFixtures.empty)
    await expect(page.getByText("Nenhum horário fixo configurado.")).toBeVisible()
    await expect(page.getByText("Nenhuma aula agendada")).toBeVisible()
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Student Agenda — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("renders agenda card and appointments on mobile", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByText("Sua agenda")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Próximas Aulas" })).toBeVisible()
  })

  test("shows weekly grid on mobile", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("weekly-schedule-view")).toBeVisible()
  })

  test("shows appointment items on mobile", async ({ page }) => {
    await setupPage(page)
    await expect(page.getByTestId("appointment-item").first()).toBeVisible()
  })
})
