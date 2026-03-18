/**
 * Service Plans — Smoke Tests
 *
 * These tests run against the real backend. Each test creates an isolated
 * coach account via registration (unique UUID email) so runs never share state.
 *
 * Run these only when the full stack is available:
 *   npx playwright test --grep @smoke
 *
 * Data isolation: each coach has its own tenantId — no cross-contamination.
 */
import { test, expect } from "@playwright/test"
import { createIsolatedCoach, injectCoachSession } from "../support/testIsolation"

test.describe("Service Plans — Smoke @smoke", () => {
  test("authenticated coach can access the services page", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/services")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='service-plans-list']", {
      timeout: 10000,
    })

    await expect(page.getByRole("heading", { name: "Planos de Serviço" })).toBeVisible()
    await expect(page.getByText("Nenhum plano cadastrado")).toBeVisible()
  })

  test("coach can create a service plan and find it in the list @smoke", async ({
    page,
    request,
  }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/services")
    await page.waitForSelector("[data-slot='empty-state']", { timeout: 10000 })

    const planName = `Smoke Test Plan ${Date.now()}`
    await page.getByTestId("create-plan-button").click()
    await expect(page.getByRole("heading", { name: "Novo plano de serviço" })).toBeVisible()

    await page.getByLabel("Nome").fill(planName)
    await page.getByLabel("Preço (R$)").fill("199.90")
    await page.getByRole("button", { name: "Salvar" }).click()

    await expect(page.getByRole("heading", { name: "Novo plano de serviço" })).not.toBeVisible()
    await expect(page.getByText(planName)).toBeVisible({ timeout: 5000 })
  })
})
