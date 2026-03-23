/**
 * Agenda — Reschedule Appointment & Training Schedule Detail
 *
 * All API calls are mocked via page.route(). No backend required.
 * Desktop only — tests rely on the weekly calendar grid layout.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockEnumAttendanceTypes,
  mockCalendar,
  mockAppointmentsList,
  mockAppointmentRequests,
  mockAvailabilityRules,
  mockAvailabilityExceptions,
  mockRescheduleAppointment,
  mockRescheduleAppointmentConflict,
  mockRescheduleTraining,
  mockRescheduleTrainingConflict,
  mockSkipTraining,
  mockDeleteTrainingException,
} from "../support/apiMocks"
import {
  mockStudentsForPage,
  setupAgendaPage,
} from "../support/schedulingHelpers"
import {
  MOCK_CALENDAR_ENTRIES,
  MOCK_APPOINTMENTS,
  MOCK_APPOINTMENT_REQUESTS_EMPTY,
  MOCK_AVAILABILITY_RULES,
  MOCK_AVAILABILITY_EXCEPTIONS,
  MOCK_RESCHEDULED_APPOINTMENT,
  MOCK_CANCELLED_APPOINTMENT,
  MOCK_COMPLETED_APPOINTMENT,
  MOCK_RESCHEDULED_TRAINING_ENTRY,
  MOCK_TRAINING_EXCEPTION,
  MOCK_SKIP_EXCEPTION,
} from "../fixtures/scheduling.fixtures"

// =============================================================================
// Agenda — Reschedule Appointment
// =============================================================================

test.describe("Agenda — Reschedule Appointment", () => {
  // Reschedule tests rely on desktop weekly calendar layout; mobile uses a different single-day view
  test.beforeEach(async ({}, testInfo) => {
    if (testInfo.project.name === "mobile-android") {
      testInfo.skip(true, "Desktop only — mobile calendar uses single-day layout")
    }
  })

  async function clickCalendarEvent(page: import("@playwright/test").Page, name: string) {
    // Calendar events are absolutely positioned inside overflow:hidden containers;
    // use evaluate(el.click()) to bypass Playwright's coordinate-based visibility checks.
    const event = page.locator(`[title*="${name}"]`).first()
    await event.waitFor({ state: "attached", timeout: 10000 })
    await event.evaluate((el) => (el as HTMLElement).click())
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })
  }

  async function openAppointmentDetail(page: import("@playwright/test").Page) {
    await setupAgendaPage(page)
    await clickCalendarEvent(page, "Ana Lima")
    await expect(page.getByRole("heading", { name: "Detalhes do agendamento" })).toBeVisible()
  }

  test("shows reschedule button for scheduled appointments", async ({ page }) => {
    await openAppointmentDetail(page)

    await expect(page.getByTestId("reschedule-button")).toBeVisible()
    await expect(page.getByTestId("reschedule-button")).toContainText("Reagendar")
  })

  test("hides reschedule button for cancelled appointments", async ({ page }) => {
    const cancelledCalendar = [
      {
        type: "appointment",
        date: "2026-03-16",
        startTime: "09:00",
        endTime: "10:00",
        studentId: "student-1",
        studentName: "Ana Lima",
        appointmentType: "presential",
        status: "cancelled",
        location: "Academia Central",
        sourceId: "appt-cancelled",
      },
    ]
    const cancelledAppointments = {
      content: [MOCK_CANCELLED_APPOINTMENT],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    }

    await page.clock.setFixedTime(new Date("2026-03-16T10:00:00.000Z"))
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, cancelledCalendar)
    await mockAppointmentsList(page, cancelledAppointments)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await clickCalendarEvent(page, "Ana Lima")

    await expect(page.getByText("Cancelado")).toBeVisible()
    await expect(page.getByTestId("reschedule-button")).not.toBeVisible()
  })

  test("hides reschedule button for completed appointments", async ({ page }) => {
    const completedCalendar = [
      {
        type: "appointment",
        date: "2026-03-16",
        startTime: "09:00",
        endTime: "10:00",
        studentId: "student-1",
        studentName: "Ana Lima",
        appointmentType: "presential",
        status: "completed",
        location: "Academia Central",
        sourceId: "appt-completed",
      },
    ]
    const completedAppointments = {
      content: [MOCK_COMPLETED_APPOINTMENT],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    }

    await page.clock.setFixedTime(new Date("2026-03-16T10:00:00.000Z"))
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, completedCalendar)
    await mockAppointmentsList(page, completedAppointments)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await clickCalendarEvent(page, "Ana Lima")

    await expect(page.getByText("Concluído")).toBeVisible()
    await expect(page.getByTestId("reschedule-button")).not.toBeVisible()
  })

  test("opens reschedule dialog with pre-filled data", async ({ page }) => {
    await openAppointmentDetail(page)

    await page.getByTestId("reschedule-button").click()

    // Detail dialog closes, reschedule dialog opens
    await page.waitForSelector("[data-testid='reschedule-dialog']", { timeout: 5000 })
    await expect(page.getByRole("heading", { name: "Reagendar" })).toBeVisible()

    // Shows original appointment reference in dialog description
    await expect(page.getByTestId("reschedule-dialog").getByText("Ana Lima")).toBeVisible()
  })

  test("reschedules appointment successfully and shows toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_ENTRIES)
    await mockAppointmentsList(page, MOCK_APPOINTMENTS)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockStudentsForPage(page)
    await mockRescheduleAppointment(page, MOCK_RESCHEDULED_APPOINTMENT)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    // Open detail dialog
    await clickCalendarEvent(page, "Ana Lima")

    // Click reschedule
    await page.getByTestId("reschedule-button").click()
    await page.waitForSelector("[data-testid='reschedule-dialog']", { timeout: 5000 })

    // Submit the form (fields are pre-filled)
    await page.getByTestId("reschedule-submit").click()

    await expect(page.getByText("Agendamento reagendado com sucesso!")).toBeVisible({ timeout: 5000 })
  })

  test("shows conflict warning when rescheduling causes conflict", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_ENTRIES)
    await mockAppointmentsList(page, MOCK_APPOINTMENTS)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockStudentsForPage(page)
    await mockRescheduleAppointmentConflict(page, [
      { type: "appointment", message: "Conflito com agendamento existente" },
    ])
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    // Open detail → reschedule dialog
    await clickCalendarEvent(page, "Ana Lima")
    await page.getByTestId("reschedule-button").click()
    await page.waitForSelector("[data-testid='reschedule-dialog']", { timeout: 5000 })

    // Submit
    await page.getByTestId("reschedule-submit").click()

    // Conflict dialog appears
    await expect(page.getByText("Conflitos detectados")).toBeVisible({ timeout: 5000 })
    await expect(page.getByText("Conflito com agendamento existente")).toBeVisible()
    await expect(page.getByTestId("force-create-btn")).toBeVisible()
  })
})

// =============================================================================
// Agenda — Training Schedule Detail
// =============================================================================

test.describe("Agenda — Training Schedule Detail", () => {
  // Training detail tests rely on desktop weekly calendar layout
  test.beforeEach(async ({}, testInfo) => {
    if (testInfo.project.name === "mobile-android") {
      testInfo.skip(true, "Desktop only — mobile calendar uses single-day layout")
    }
  })

  async function clickTrainingEvent(page: import("@playwright/test").Page) {
    const event = page.locator("[title*='Treino — Bruno Souza']").first()
    await event.waitFor({ state: "attached", timeout: 10000 })
    await event.evaluate((el) => (el as HTMLElement).click())
    await page.waitForSelector("[data-testid='training-detail-dialog']", { timeout: 5000 })
  }

  test("clicking a training schedule event opens detail dialog", async ({ page }) => {
    await setupAgendaPage(page)
    await clickTrainingEvent(page)

    await expect(page.getByRole("heading", { name: "Detalhes do treino" })).toBeVisible()
    await expect(page.getByTestId("training-detail-dialog").getByText("Bruno Souza")).toBeVisible()
  })

  test("detail dialog shows reschedule and skip buttons", async ({ page }) => {
    await setupAgendaPage(page)
    await clickTrainingEvent(page)

    await expect(page.getByTestId("reschedule-training-button")).toBeVisible()
    await expect(page.getByTestId("skip-training-button")).toBeVisible()
  })

  test("reschedule button opens reschedule training dialog", async ({ page }) => {
    await setupAgendaPage(page)
    await clickTrainingEvent(page)

    await page.getByTestId("reschedule-training-button").click()
    await page.waitForSelector("[data-testid='reschedule-training-dialog']", { timeout: 5000 })

    await expect(page.getByRole("heading", { name: "Reagendar treino" })).toBeVisible()
    await expect(page.getByTestId("reschedule-training-dialog").getByText("Bruno Souza")).toBeVisible()
  })

  test("skip training succeeds and shows toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_ENTRIES)
    await mockAppointmentsList(page, MOCK_APPOINTMENTS)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockStudentsForPage(page)
    await mockSkipTraining(page, MOCK_SKIP_EXCEPTION)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header'], [data-testid='new-appointment-btn']", { timeout: 10000 })

    await clickTrainingEvent(page)
    await page.getByTestId("skip-training-button").click()

    await expect(page.getByText("Treino pulado com sucesso!")).toBeVisible({ timeout: 5000 })
  })

  test("reschedule training succeeds and shows toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_ENTRIES)
    await mockAppointmentsList(page, MOCK_APPOINTMENTS)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockStudentsForPage(page)
    await mockRescheduleTraining(page, MOCK_TRAINING_EXCEPTION)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header'], [data-testid='new-appointment-btn']", { timeout: 10000 })

    await clickTrainingEvent(page)
    await page.getByTestId("reschedule-training-button").click()
    await page.waitForSelector("[data-testid='reschedule-training-dialog']", { timeout: 5000 })

    await page.getByTestId("training-reschedule-submit").click()

    await expect(page.getByText("Treino reagendado com sucesso!")).toBeVisible({ timeout: 5000 })
  })

  test("reschedule training shows conflict warning", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_ENTRIES)
    await mockAppointmentsList(page, MOCK_APPOINTMENTS)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockStudentsForPage(page)
    await mockRescheduleTrainingConflict(page, [
      { type: "appointment", message: "Conflito com agendamento existente" },
    ])
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header'], [data-testid='new-appointment-btn']", { timeout: 10000 })

    await clickTrainingEvent(page)
    await page.getByTestId("reschedule-training-button").click()
    await page.waitForSelector("[data-testid='reschedule-training-dialog']", { timeout: 5000 })

    await page.getByTestId("training-reschedule-submit").click()

    await expect(page.getByText("Conflitos detectados")).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId("force-create-btn")).toBeVisible()
  })

  test("rescheduled training shows undo button instead of reschedule/skip", async ({ page }) => {
    const rescheduledCalendar = [
      MOCK_RESCHEDULED_TRAINING_ENTRY,
    ]

    await page.clock.setFixedTime(new Date("2026-03-16T10:00:00.000Z"))
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, rescheduledCalendar)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockStudentsForPage(page)
    await mockDeleteTrainingException(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header'], [data-testid='new-appointment-btn']", { timeout: 10000 })

    const event = page.locator("[title*='Treino — Bruno Souza']").first()
    await event.waitFor({ state: "attached", timeout: 10000 })
    await event.evaluate((el) => (el as HTMLElement).click())
    await page.waitForSelector("[data-testid='training-detail-dialog']", { timeout: 5000 })

    await expect(page.getByText("Reagendado")).toBeVisible()
    await expect(page.getByTestId("undo-reschedule-button")).toBeVisible()
    await expect(page.getByTestId("reschedule-training-button")).not.toBeVisible()
    await expect(page.getByTestId("skip-training-button")).not.toBeVisible()
  })
})
