/**
 * Scheduling — Shared test setup helpers
 *
 * Reusable setup functions for scheduling behavioral tests.
 */
import { Page } from "@playwright/test"
import {
  injectMockAuth,
  mockEnumAttendanceTypes,
  mockCalendar,
  mockAppointmentsList,
  mockAppointmentRequests,
  mockAvailabilityRules,
  mockAvailabilityExceptions,
} from "./apiMocks"
import {
  MOCK_CALENDAR_ENTRIES,
  MOCK_CALENDAR_EMPTY,
  MOCK_APPOINTMENTS,
  MOCK_APPOINTMENT_REQUESTS_EMPTY,
  MOCK_AVAILABILITY_RULES,
  MOCK_AVAILABILITY_EXCEPTIONS,
  MOCK_STUDENTS_FOR_SELECT,
} from "../fixtures/scheduling.fixtures"

export async function mockStudentsForPage(page: Page) {
  await page.route("**/api/v1/students*", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ status: 200, contentType: "application/json", json: MOCK_STUDENTS_FOR_SELECT })
    } else {
      route.fallback()
    }
  })
}

export async function mockAvailabilityEndpoints(page: Page) {
  await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
  await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
}

export async function setupAgendaPage(page: Page) {
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

export async function setupDisponibilidadePage(page: Page) {
  await injectMockAuth(page)
  await mockCalendar(page, MOCK_CALENDAR_EMPTY)
  await mockAvailabilityRules(page, MOCK_AVAILABILITY_RULES)
  await mockAvailabilityExceptions(page, MOCK_AVAILABILITY_EXCEPTIONS)
  await page.goto("/disponibilidade")
  await page.waitForSelector("[data-slot='page-header']", { timeout: 8000 })
}
