/**
 * Disponibilidade — Availability Rules, Blocked Dates, Wizard & Date Range Block
 *
 * All API calls are mocked via page.route(). No backend required.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockCalendar,
  mockAvailabilityRules,
  mockAvailabilityExceptions,
  mockCreateAvailabilityRule,
  mockBulkCreateAvailabilityRules,
  mockDeleteAvailabilityRule,
  mockCreateAvailabilityException,
  mockDeleteAvailabilityException,
} from "../support/apiMocks"
import {
  setupDisponibilidadePage,
} from "../support/schedulingHelpers"
import {
  MOCK_CALENDAR_EMPTY,
  MOCK_AVAILABILITY_RULES,
  MOCK_AVAILABILITY_EXCEPTIONS,
  MOCK_NEW_RULE,
  MOCK_NEW_EXCEPTION,
} from "../fixtures/scheduling.fixtures"

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
