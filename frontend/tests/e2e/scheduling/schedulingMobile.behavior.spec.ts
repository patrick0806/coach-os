/**
 * Scheduling — Mobile Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 */
import { test, expect } from "@playwright/test"
import { setupAgendaPage, setupDisponibilidadePage } from "../support/schedulingHelpers"

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
