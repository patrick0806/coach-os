import { test, expect } from "@playwright/test"
import { injectMockAuth, mockDashboardStats, mockStudentsList, mockGetMyProfile } from "../support/apiMocks"
import { DASHBOARD_STATS, studentsPaginated, PROFILE_COMPLETE } from "../utils/comprehensiveFixtures"
import { setupAgendaPage, setupDisponibilidadePage } from "../support/schedulingHelpers"

test.describe("Core E2E — Responsive sanity", () => {
  test("coach pages render sem quebrar no mobile", async ({ page }) => {
    await injectMockAuth(page)
    await mockDashboardStats(page, DASHBOARD_STATS)
    await mockStudentsList(page, studentsPaginated)
    await mockGetMyProfile(page, PROFILE_COMPLETE)

    await page.goto("/dashboard")
    await expect(page.locator("[data-slot='page-header'], h1, h2").first()).toBeVisible()

    await page.goto("/students")
    await page.waitForSelector("[data-testid='student-card']", { timeout: 8000 })
    await expect(page.getByTestId("student-card").first()).toBeVisible()

    await page.goto("/settings")
    await page.waitForSelector("h1", { timeout: 8000 })
    await expect(page.getByRole("heading", { name: "Configuracoes" })).toBeVisible()
  })

  test("scheduling renderiza no mobile com ações essenciais visíveis", async ({ page }) => {
    await setupAgendaPage(page)
    await expect(page.locator("[data-slot='page-header'] h1")).toContainText("Agenda")
    await expect(page.getByTestId("new-appointment-btn")).toBeVisible()

    await setupDisponibilidadePage(page)
    await expect(page.locator("[data-slot='page-header'] h1")).toContainText("Disponibilidade")
  })
})
