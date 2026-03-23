/**
 * Scheduling — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockCalendar,
  mockAppointmentsList,
  mockCreateAppointment,
  mockCreateAppointmentConflict,
  mockAppointmentRequests,
  mockApproveAppointmentRequest,
  mockRejectAppointmentRequest,
  mockAvailabilityRules,
  mockCreateAvailabilityRule,
  mockBulkCreateAvailabilityRules,
  mockDeleteAvailabilityRule,
  mockAvailabilityExceptions,
  mockCreateAvailabilityException,
  mockDeleteAvailabilityException,
  mockEnumAttendanceTypes,
  mockRescheduleAppointment,
  mockRescheduleAppointmentConflict,
  mockRescheduleTraining,
  mockRescheduleTrainingConflict,
  mockSkipTraining,
  mockDeleteTrainingException,
} from "../support/apiMocks"
import {
  MOCK_CALENDAR_ENTRIES,
  MOCK_CALENDAR_EMPTY,
  MOCK_APPOINTMENTS,
  MOCK_APPOINTMENT_REQUESTS_PENDING,
  MOCK_APPOINTMENT_REQUESTS_EMPTY,
  MOCK_AVAILABILITY_RULES,
  MOCK_AVAILABILITY_EXCEPTIONS,
  MOCK_NEW_APPOINTMENT,
  MOCK_STUDENTS_FOR_SELECT,
  MOCK_NEW_RULE,
  MOCK_NEW_EXCEPTION,
  MOCK_RESCHEDULED_APPOINTMENT,
  MOCK_CANCELLED_APPOINTMENT,
  MOCK_COMPLETED_APPOINTMENT,
  MOCK_RESCHEDULED_TRAINING_ENTRY,
  MOCK_TRAINING_EXCEPTION,
  MOCK_SKIP_EXCEPTION,
} from "../fixtures/scheduling.fixtures"

// --- Setup helpers ---

async function mockStudentsForPage(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/students*", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: MOCK_STUDENTS_FOR_SELECT })
    } else {
      route.fallback()
    }
  })
}

async function mockAvailabilityEndpoints(page: import("@playwright/test").Page) {
  await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
  await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
}

async function setupAgendaPage(page: import("@playwright/test").Page) {
  // Freeze time to the week of the fixture data (2026-03-16 Mon–Sun) so calendar events are visible
  await page.clock.setFixedTime(new Date("2026-03-16T10:00:00.000Z"))
  await injectMockAuth(page)
  await mockEnumAttendanceTypes(page)
  await mockCalendar(page, MOCK_CALENDAR_ENTRIES)
  await mockAppointmentsList(page, MOCK_APPOINTMENTS)
  await mockAppointmentRequests(page, MOCK_APPOINTMENT_REQUESTS_EMPTY)
  await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
  await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
  await mockStudentsForPage(page)
  await page.goto("/agenda")
  await page.waitForSelector("[data-slot='page-header'], [data-testid='new-appointment-btn']", { timeout: 10000 })
  // Wait for calendar entries to finish rendering
  await page.waitForFunction(
    () => document.querySelectorAll("[title]").length > 3,
    { timeout: 10000 }
  ).catch(() => {})
}

async function setupDisponibilidadePage(page: import("@playwright/test").Page) {
  await injectMockAuth(page)
  await mockCalendar(page, MOCK_CALENDAR_EMPTY)
  await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
  await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
  await page.goto("/disponibilidade")
  await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })
}

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

// =============================================================================
// Disponibilidade — Availability Rules
// =============================================================================

test.describe("Disponibilidade — Availability Rules", () => {
  test("renders the disponibilidade page with header", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await expect(page.locator("[data-slot='page-header'] h1")).toContainText("Disponibilidade")
  })

  test("shows list of availability rules grouped by day", async ({ page }) => {
    await setupDisponibilidadePage(page)

    // Tab should be active by default
    await expect(page.getByText("Horários disponíveis")).toBeVisible()

    // Day groups should be visible
    const dayGroups = page.getByTestId("availability-day-group")
    await expect(dayGroups.first()).toBeVisible()
    await expect(page.getByText("Segunda")).toBeVisible()
    await expect(page.getByText("08:00 – 12:00")).toBeVisible()

    // Rule items inside groups
    const ruleItems = page.getByTestId("availability-rule-item")
    await expect(ruleItems.first()).toBeVisible()
  })

  test("opens add availability rule dialog", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByTestId("add-rule-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })
    await expect(page.getByRole("heading", { name: "Adicionar horário" })).toBeVisible()
  })

  test("creates availability rule and shows success toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockCreateAvailabilityRule(page, MOCK_NEW_RULE)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await page.getByTestId("add-rule-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await page.getByTestId("availability-rule-submit").click()

    await expect(page.getByText("Horário criado com sucesso!")).toBeVisible({ timeout: 5000 })
  })

  test("deletes availability rule with confirmation", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockDeleteAvailabilityRule(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await page.getByTestId("delete-rule-btn").first().click()
    await page.waitForSelector("[role='alertdialog']", { timeout: 5000 })

    await page.getByRole("button", { name: "Remover" }).click()

    await expect(page.getByText("Horário removido.")).toBeVisible({ timeout: 5000 })
  })

  test("shows empty state when no rules defined", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, [])
    await mockAvailabilityExceptions(page, [])
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await expect(page.getByText("Nenhum horário definido")).toBeVisible()
  })
})

// =============================================================================
// Disponibilidade — Availability Exceptions
// =============================================================================

test.describe("Disponibilidade — Blocked Dates", () => {
  test("switches to blocked dates tab", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()

    await expect(page.getByText("Bloqueie datas específicas")).toBeVisible()
  })

  test("shows blocked date in list", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()

    await expect(page.getByTestId("availability-exception-item")).toBeVisible()
    await expect(page.getByText("Feriado")).toBeVisible()
  })

  test("opens block date dialog", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()
    await page.getByTestId("add-exception-btn").click()

    await page.waitForSelector("[role='dialog']", { timeout: 5000 })
    await expect(page.getByRole("heading", { name: "Bloquear data" })).toBeVisible()
  })

  test("creates blocked date and shows success toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockCreateAvailabilityException(page, MOCK_NEW_EXCEPTION)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()
    await page.getByTestId("add-exception-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await page.getByLabel("Motivo (opcional)").fill("Férias")
    await page.getByTestId("block-date-submit").click()

    await expect(page.getByText("Data bloqueada com sucesso!")).toBeVisible({ timeout: 5000 })
  })

  test("deletes blocked date with confirmation", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockDeleteAvailabilityException(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()
    await page.getByTestId("delete-exception-btn").first().click()
    await page.waitForSelector("[role='alertdialog']", { timeout: 5000 })

    await page.getByRole("button", { name: "Desbloquear" }).click()

    await expect(page.getByText("Data desbloqueada.")).toBeVisible({ timeout: 5000 })
  })

  test("shows empty state when no blocked dates", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, [])
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()

    await expect(page.getByText("Nenhuma data bloqueada")).toBeVisible()
  })
})

// =============================================================================
// Disponibilidade — Availability Wizard
// =============================================================================

test.describe("Disponibilidade — Availability Wizard", () => {
  test("shows wizard button on disponibilidade page", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await expect(page.getByTestId("open-wizard-btn")).toBeVisible()
  })

  test("opens wizard dialog when button clicked", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByTestId("open-wizard-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await expect(page.getByRole("heading", { name: "Configurar disponibilidade em lote" })).toBeVisible()
  })

  test("wizard step 1 shows day selection", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByTestId("open-wizard-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await expect(page.getByText("Dias da semana", { exact: true })).toBeVisible()
    // Day buttons (Mon=1, Tue=2, etc)
    await expect(page.getByTestId("wizard-day-1")).toBeVisible()
    await expect(page.getByTestId("wizard-day-5")).toBeVisible()
  })

  test("wizard next button disabled until a day is selected", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByTestId("open-wizard-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await expect(page.getByTestId("wizard-next-btn")).toBeDisabled()
  })

  test("wizard advances to step 2 after selecting a day", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByTestId("open-wizard-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await page.getByTestId("wizard-day-1").click()
    await page.getByTestId("wizard-next-btn").click()

    await expect(page.getByText("Horários e pausas")).toBeVisible()
    await expect(page.getByText("Início do período")).toBeVisible()
    await expect(page.getByText("Duração do slot")).toBeVisible()
  })

  test("wizard creates rules and shows success toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockBulkCreateAvailabilityRules(page)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await page.getByTestId("open-wizard-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    // Step 1: select Friday (no existing rules → no conflicts)
    await page.getByTestId("wizard-day-5").click()
    await page.getByTestId("wizard-next-btn").click()

    // Step 2: accept defaults
    await page.getByTestId("wizard-next-btn").click()

    // Step 3: should show available slots, confirm
    await expect(page.getByText(/slots? ser/)).toBeVisible({ timeout: 3000 })
    await page.getByTestId("wizard-confirm-btn").click()

    await expect(page.getByText(/regra(s)? criada(s)? com sucesso/)).toBeVisible({ timeout: 5000 })
  })

  test("wizard shows conflict pre-check for existing rules", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockCreateAvailabilityRule(page, MOCK_NEW_RULE)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await page.getByTestId("open-wizard-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    // Step 1: select Monday (has existing rule 08:00-12:00 → partial conflict)
    await page.getByTestId("wizard-day-1").click()
    await page.getByTestId("wizard-next-btn").click()

    // Step 2: accept defaults (08:00-18:00, 60min slots)
    await page.getByTestId("wizard-next-btn").click()

    // Step 3: should show some ignored slots
    await expect(page.getByText(/ignorado/)).toBeVisible({ timeout: 3000 })
  })
})

// =============================================================================
// Disponibilidade — Date Range Block
// =============================================================================

test.describe("Disponibilidade — Date Range Block", () => {
  test("block date dialog has mode toggle", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()
    await page.getByTestId("add-exception-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await expect(page.getByText("Dia único")).toBeVisible()
    await expect(page.getByText("Intervalo de datas")).toBeVisible()
  })

  test("switching to range mode shows start/end date fields", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()
    await page.getByTestId("add-exception-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await page.getByText("Intervalo de datas").click()

    await expect(page.getByLabel("Data inicial")).toBeVisible()
    await expect(page.getByLabel("Data final")).toBeVisible()
  })

  test("creates date range block and shows success toast", async ({ page }) => {
    await injectMockAuth(page)
    await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
    await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
    await mockCreateAvailabilityException(page, MOCK_NEW_EXCEPTION)
    await mockCalendar(page, MOCK_CALENDAR_EMPTY)
    await page.goto("/disponibilidade")
    await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Datas bloqueadas" }).click()
    await page.getByTestId("add-exception-btn").click()
    await page.waitForSelector("[role='dialog']", { timeout: 5000 })

    await page.getByText("Intervalo de datas").click()

    await page.getByLabel("Data inicial").fill("2026-04-07")
    await page.getByLabel("Data final").fill("2026-04-09")

    await page.getByTestId("block-date-submit").click()

    await expect(page.getByText(/dia(s)? bloqueado(s)? com sucesso/)).toBeVisible({ timeout: 5000 })
  })
})

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

// =============================================================================
// Mobile
// =============================================================================

test.describe("Scheduling — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("agenda page renders on mobile", async ({ page }) => {
    await setupAgendaPage(page)

    await expect(page.locator("[data-slot='page-header'] h1")).toContainText("Agenda")
    await expect(page.getByTestId("new-appointment-btn")).toBeVisible()
  })

  test("disponibilidade page renders on mobile", async ({ page }) => {
    await setupDisponibilidadePage(page)

    await expect(page.locator("[data-slot='page-header'] h1")).toContainText("Disponibilidade")
  })
})
