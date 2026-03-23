/**
 * Agenda — Calendar Display, Create Appointment & Pending Requests
 *
 * All API calls are mocked via page.route(). No backend required.
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
  mockCreateAppointment,
  mockCreateAppointmentConflict,
  mockApproveAppointmentRequest,
  mockRejectAppointmentRequest,
} from "../support/apiMocks"
import {
  mockStudentsForPage,
  mockAvailabilityEndpoints,
  setupAgendaPage,
} from "../support/schedulingHelpers"
import {
  MOCK_CALENDAR_ENTRIES,
  MOCK_CALENDAR_EMPTY,
  MOCK_APPOINTMENTS,
  MOCK_APPOINTMENT_REQUESTS_PENDING,
  MOCK_APPOINTMENT_REQUESTS_EMPTY,
  MOCK_AVAILABILITY_RULES,
  MOCK_AVAILABILITY_EXCEPTIONS,
  MOCK_NEW_APPOINTMENT,
} from "../fixtures/scheduling.fixtures"

// =============================================================================
// Agenda — Calendar Display
// =============================================================================

test.describe("Agenda — Calendar Display", () => {
  test("renders the agenda page with header and calendar", async ({ page }) => {
    await setupAgendaPage(page)

    await expect(page.locator("[data-slot='page-header'] h1")).toContainText("Agenda")
    await expect(page.getByTestId("new-appointment-btn")).toBeVisible()
  })

  test("shows pending requests button", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_PENDING)
    await mockAvailabilityEndpoints(page)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await expect(page.getByText("Solicitações")).toBeVisible()
  })

  test("shows pending count badge when there are pending requests", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_PENDING)
    await mockAvailabilityEndpoints(page)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    // Should show a badge with the count inside the Solicitações button
    const badge = page.locator("button:has-text('Solicitações') span.rounded-full")
    await expect(badge).toBeVisible({ timeout: 5000 })
  })

  test("shows week navigation controls", async ({ page }) => {
    await setupAgendaPage(page)

    await expect(page.getByRole("button", { name: "Hoje" })).toBeVisible({ timeout: 5000 })
  })

  test("renders calendar week grid with day headers", async ({ page }) => {
    await setupAgendaPage(page)

    const vp = page.viewportSize()
    if (vp && vp.width < 640) {
      // Mobile view shows single-day calendar with navigation
      await expect(page.getByRole("button", { name: "Hoje" }).first()).toBeVisible()
      return
    }

    // Desktop: day abbreviations rendered inside .tracking-wider divs by date-fns ptBR locale
    // Using class-scoped locator to avoid matching the hidden mobile day label
    const dayAbbrevs = page.locator(".tracking-wider")
    await expect(dayAbbrevs.first()).toBeVisible({ timeout: 5000 })
    // Verify the 7-day week grid is rendered
    await expect(dayAbbrevs).toHaveCount(7)
  })
})

// =============================================================================
// Agenda — Create Appointment
// =============================================================================

test.describe("Agenda — Create Appointment", () => {
  test("opens create appointment dialog when clicking button", async ({ page }) => {
    await setupAgendaPage(page)

    await page.getByTestId("new-appointment-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })
    await expect(page.getByRole("heading", { name: "Novo agendamento" })).toBeVisible()
  })

  test("create appointment dialog has required fields", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityEndpoints(page)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByTestId("new-appointment-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await expect(page.getByTestId("date-picker-trigger")).toBeVisible()
    await expect(page.getByText("Tipo")).toBeVisible()
  })

  test("create appointment form shows location field for presencial type", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityEndpoints(page)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByTestId("new-appointment-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await expect(page.getByLabel("Local")).toBeVisible()
  })

  test("creates appointment successfully and closes dialog", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_ENTRIES)
    await mockAppointmentsList(page, MOCK_APPOINTMENTS)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityEndpoints(page)
    await mockCreateAppointment(page, MOCK_NEW_APPOINTMENT)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByTestId("new-appointment-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    // Select student
    await page.getByTestId("student-select").click()
    await page.getByRole("option", { name: "Ana Lima" }).click()

    // Fill location
    await page.getByLabel("Local").fill("Academia Central")

    await page.getByTestId("create-appointment-submit").click()

    // Dialog should close and success toast
    await expect(page.getByText("Agendamento criado com sucesso!")).toBeVisible({ timeout: 5000 })
  })

  test("shows conflict warning dialog when API returns 409", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_ENTRIES)
    await mockAppointmentsList(page, MOCK_APPOINTMENTS)
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityEndpoints(page)
    await mockCreateAppointmentConflict(page, [
      { type: "appointment", message: "Já existe um agendamento nesse horário" },
    ])
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByTestId("new-appointment-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await page.getByTestId("student-select").click()
    await page.getByRole("option", { name: "Ana Lima" }).click()
    await page.getByLabel("Local").fill("Academia Central")

    await page.getByTestId("create-appointment-submit").click()

    await expect(page.getByText("Conflitos detectados")).toBeVisible({ timeout: 5000 })
    await expect(page.getByText("Já existe um agendamento nesse horário")).toBeVisible()
    await expect(page.getByTestId("force-create-btn")).toBeVisible()
  })

  test("closes create dialog when cancel is clicked", async ({ page }) => {
    await setupAgendaPage(page)

    await page.getByTestId("new-appointment-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await page.getByRole("button", { name: "Cancelar" }).first().click()

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 })
  })
})

// =============================================================================
// Agenda — Pending Requests Sheet
// =============================================================================

test.describe("Agenda — Pending Requests", () => {
  test("opens pending requests sheet", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_PENDING)
    await mockAvailabilityEndpoints(page)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByText("Solicitações").click()
    await expect(page.getByText("Solicitações pendentes")).toBeVisible({ timeout: 5000 })
  })

  test("shows pending request item with student name and time", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_PENDING)
    await mockAvailabilityEndpoints(page)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByText("Solicitações").click()
    await page.waitForSelector("[data-testid='request-item']", { timeout: 5000 })

    await expect(page.getByText("Bruno Souza")).toBeVisible()
    await expect(page.getByTestId("approve-request-btn")).toBeVisible()
    await expect(page.getByTestId("reject-request-btn")).toBeVisible()
  })

  test("shows empty state when no pending requests", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
    await mockAvailabilityEndpoints(page)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByText("Solicitações").click()
    await page.waitForSelector(".py-12, [data-testid='request-item']", { timeout: 5000 })

    await expect(page.getByText("Nenhuma solicitação pendente")).toBeVisible()
  })

  test("approves appointment request and shows success toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_PENDING)
    await mockAvailabilityEndpoints(page)
    await mockApproveAppointmentRequest(page, MOCK_NEW_APPOINTMENT)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByText("Solicitações").click()
    await page.waitForSelector("[data-testid='approve-request-btn']", { timeout: 5000 })

    const approveBtn = page.getByTestId("approve-request-btn")
    await approveBtn.click({ force: true })

    await expect(
      page.getByText("Solicitação aprovada e agendamento criado!")
    ).toBeVisible({ timeout: 5000 })
  })

  test("rejects appointment request and shows success toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockEnumAttendanceTypes(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await mockAppointmentsList(page, { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
    await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_PENDING)
    await mockAvailabilityEndpoints(page)
    await mockRejectAppointmentRequest(page)
    await mockStudentsForPage(page)
    await page.goto("/agenda")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 10000 })

    await page.getByText("Solicitações").click()
    await page.waitForSelector("[data-testid='reject-request-btn']", { timeout: 5000 })

    await page.getByTestId("reject-request-btn").click()

    await expect(page.getByText("Solicitação rejeitada.")).toBeVisible({ timeout: 5000 })
  })
})
