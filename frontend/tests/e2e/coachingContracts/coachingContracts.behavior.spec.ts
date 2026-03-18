/**
 * Coaching Contracts — Behavioral Tests
 *
 * These tests run entirely with mocked API responses (page.route).
 * No backend required. Deterministic regardless of accumulated data.
 *
 * Coverage:
 *   - "Serviço" tab visible on student detail page
 *   - Active plan displayed in detail card
 *   - Empty state when no contract
 *   - Assign plan dialog (open, plan list, submit)
 *   - Warning shown when replacing active contract
 *   - Plan change creates new active contract
 *   - Cancel contract moves it to history
 *   - Past contracts shown in history section
 *   - Mobile viewport
 */
import { test, expect } from "@playwright/test"
import type { Page, Route } from "@playwright/test"
import {
  injectMockAuth,
  mockStudentContracts,
  mockStudentContractsStateful,
  mockCreateContract,
  mockCancelContract,
} from "../support/apiMocks"
import {
  coachingContractsFixtures,
  activeContract,
  cancelledContract,
  newActiveContract,
  MOCK_STUDENT_ID,
} from "../fixtures/coachingContracts.fixtures"
import { activeStudents } from "../fixtures/students.fixtures"
import { onlinePlan, presentialPlan } from "../fixtures/services.fixtures"

// --- Helpers ---

const STUDENT = activeStudents[0] // id: "st-1"

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
  await page.route(`**/api/v1/students/${MOCK_STUDENT_ID}/notes*`, (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 1 },
      })
    } else {
      route.fallback()
    }
  })
}

async function mockStudentPrograms(page: Page) {
  await page.route(`**/api/v1/student-programs/students/${MOCK_STUDENT_ID}/programs*`, (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 1 },
      })
    } else {
      route.fallback()
    }
  })
}

async function mockServicePlansList(page: Page) {
  await page.route("**/api/v1/service-plans*", (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    const isListGet = method === "GET" && !url.match(/\/service-plans\/[^/?]+(?:\?|$)/)
    if (isListGet) {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: [onlinePlan, presentialPlan],
      })
    } else {
      route.fallback()
    }
  })
}

async function setupStudentPage(page: Page, contractsResponse: object[]) {
  await injectMockAuth(page)
  await mockStudentDetail(page)
  await mockStudentNotes(page)
  await mockStudentPrograms(page)
  await mockStudentContracts(page, MOCK_STUDENT_ID, contractsResponse)
  await mockServicePlansList(page)
  await page.goto(`/students/${MOCK_STUDENT_ID}`)
  await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })
}

// =============================================================================
// Tab Visibility
// =============================================================================

test.describe("Coaching Contracts — Tab Visibility", () => {
  test("shows Serviço tab on student detail page", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.empty)

    await expect(page.getByRole("tab", { name: "Serviço" })).toBeVisible()
  })

  test("shows contract section when Serviço tab is clicked", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.empty)

    await page.getByRole("tab", { name: "Serviço" }).click()
    await expect(page.getByTestId("student-contract-section")).toBeVisible()
  })
})

// =============================================================================
// Active Plan Display
// =============================================================================

test.describe("Coaching Contracts — Active Plan", () => {
  test("shows active contract card with plan name and price", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.withActiveContract)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await expect(page.getByTestId("active-contract-card")).toBeVisible()
    await expect(page.getByText("Consultoria Online")).toBeVisible()
    await expect(page.getByText("R$\u00a0299,90")).toBeVisible()
  })

  test("shows attendanceType badge on active contract", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.withActiveContract)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await expect(page.getByText("Online").first()).toBeVisible()
  })

  test("shows Trocar plano button when active contract exists", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.withActiveContract)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await expect(page.getByTestId("change-plan-button")).toBeVisible()
  })
})

// =============================================================================
// Empty State
// =============================================================================

test.describe("Coaching Contracts — Empty State", () => {
  test("shows empty state when no contract", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.empty)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await expect(page.getByText("Nenhum plano vinculado")).toBeVisible()
  })

  test("shows Vincular plano button in empty state", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.empty)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await expect(page.getByTestId("assign-plan-button")).toBeVisible()
  })
})

// =============================================================================
// Assign Plan Dialog
// =============================================================================

test.describe("Coaching Contracts — Assign Plan Dialog", () => {
  test("opens assign plan dialog when clicking Vincular plano", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.empty)
    await mockServicePlansList(page)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await page.getByTestId("assign-plan-button").click()
    await expect(page.getByTestId("assign-plan-dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Vincular plano de serviço" })).toBeVisible()
  })

  test("shows list of available plans in dialog", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.empty)
    await mockServicePlansList(page)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await page.getByTestId("assign-plan-button").click()
    await page.getByTestId("service-plan-select").click()

    await expect(page.getByRole("option", { name: "Consultoria Online" })).toBeVisible()
    await expect(page.getByRole("option", { name: "Personal Presencial" })).toBeVisible()
  })

  test("vincula plan and shows it as active (stateful)", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockStudentPrograms(page)
    await mockStudentContractsStateful(
      page,
      MOCK_STUDENT_ID,
      coachingContractsFixtures.empty,
      coachingContractsFixtures.withActiveContract,
    )
    await mockServicePlansList(page)
    await mockCreateContract(page, MOCK_STUDENT_ID, activeContract)
    await page.goto(`/students/${MOCK_STUDENT_ID}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Serviço" }).click()
    await page.getByTestId("assign-plan-button").click()
    await page.getByTestId("service-plan-select").click()
    await page.getByRole("option", { name: "Consultoria Online" }).click()
    await page.getByTestId("assign-plan-submit").click()

    await expect(page.getByTestId("active-contract-card")).toBeVisible()
    await expect(
      page.getByTestId("active-contract-card").getByText("Consultoria Online")
    ).toBeVisible()
  })
})

// =============================================================================
// Replace Plan Warning
// =============================================================================

test.describe("Coaching Contracts — Replace Plan Warning", () => {
  test("shows warning when replacing an active contract", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.withActiveContract)
    await mockServicePlansList(page)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await page.getByTestId("change-plan-button").click()
    await expect(page.getByTestId("assign-plan-dialog")).toBeVisible()
    await expect(page.getByText("será substituído")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Trocar plano de serviço" })).toBeVisible()
  })
})

// =============================================================================
// Plan History
// =============================================================================

test.describe("Coaching Contracts — History", () => {
  test("shows past contracts in history section", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.withHistory)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await expect(page.getByTestId("past-contract-card")).toBeVisible()
    await expect(page.getByText("Personal Presencial")).toBeVisible()
    await expect(page.getByText("Cancelado")).toBeVisible()
  })

  test("shows cancelled contract after plan change (stateful)", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockStudentPrograms(page)
    await mockStudentContractsStateful(
      page,
      MOCK_STUDENT_ID,
      coachingContractsFixtures.withActiveContract,
      coachingContractsFixtures.afterPlanChange,
    )
    await mockServicePlansList(page)
    await mockCreateContract(page, MOCK_STUDENT_ID, newActiveContract)
    await page.goto(`/students/${MOCK_STUDENT_ID}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Serviço" }).click()
    await page.getByTestId("change-plan-button").click()
    await page.getByTestId("service-plan-select").click()
    await page.getByRole("option", { name: "Personal Presencial" }).click()
    await page.getByTestId("assign-plan-submit").click()

    await expect(page.getByTestId("past-contract-card")).toBeVisible()
    await expect(page.getByText("Cancelado")).toBeVisible()
  })
})

// =============================================================================
// Cancel Contract
// =============================================================================

test.describe("Coaching Contracts — Cancel", () => {
  test("cancels active contract (stateful)", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentDetail(page)
    await mockStudentNotes(page)
    await mockStudentPrograms(page)
    await mockStudentContractsStateful(
      page,
      MOCK_STUDENT_ID,
      coachingContractsFixtures.withActiveContract,
      coachingContractsFixtures.afterCancel,
    )
    const cancelledResponse = { ...activeContract, status: "cancelled", endDate: "2026-03-18T00:00:00Z" }
    await mockCancelContract(page, cancelledResponse)
    await mockServicePlansList(page)
    await page.goto(`/students/${MOCK_STUDENT_ID}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 8000 })

    await page.getByRole("tab", { name: "Serviço" }).click()
    // Use force click since icon buttons inside flex containers may require it on some viewports
    await page.getByTestId("cancel-contract-button").click({ force: true })

    await expect(page.getByText("Nenhum plano vinculado")).toBeVisible()
    await expect(page.getByTestId("past-contract-card")).toBeVisible()
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Coaching Contracts — Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("shows Serviço tab and contract section on mobile", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.withActiveContract)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await expect(page.getByTestId("active-contract-card")).toBeVisible()
    await expect(page.getByText("Consultoria Online")).toBeVisible()
  })

  test("shows empty state on mobile", async ({ page }) => {
    await setupStudentPage(page, coachingContractsFixtures.empty)
    await page.getByRole("tab", { name: "Serviço" }).click()

    await expect(page.getByText("Nenhum plano vinculado")).toBeVisible()
  })
})
