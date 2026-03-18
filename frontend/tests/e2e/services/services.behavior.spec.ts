/**
 * Service Plans — Behavioral Tests
 *
 * These tests run entirely with mocked API responses (page.route).
 * No backend required. Deterministic regardless of accumulated data.
 *
 * Coverage:
 *   - Page structure and navigation
 *   - List display (online and presential badges)
 *   - Empty state
 *   - Create dialog (form, submission)
 *   - Edit dialog (pre-populated form, update)
 *   - Delete dialog (confirmation, removal)
 *   - Mobile viewport
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockServicePlansList,
  mockServicePlansListStateful,
  mockCreateServicePlan,
  mockUpdateServicePlan,
  mockDeleteServicePlan,
} from "../support/apiMocks"
import { servicePlansFixtures, onlinePlan, presentialPlan } from "../fixtures/services.fixtures"

// --- Setup helpers ---

async function setupPage(page: import("@playwright/test").Page, listFixture: object[]) {
  await injectMockAuth(page)
  await mockServicePlansList(page, listFixture)
  await page.goto("/services")
  await page.waitForSelector("[data-slot='empty-state'], [data-testid='service-plans-list']", {
    timeout: 8000,
  })
}

// =============================================================================
// List & Display
// =============================================================================

test.describe("Service Plans — List & Display", () => {
  test("shows page heading and create button", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    await expect(page.getByRole("heading", { name: "Planos de Serviço" })).toBeVisible()
    await expect(page.getByTestId("create-plan-button")).toBeVisible()
  })

  test("shows plan cards with name and price", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    await expect(page.getByText("Consultoria Online")).toBeVisible()
    await expect(page.getByText("Personal Presencial")).toBeVisible()
  })

  test("shows 'Online' badge for online plans", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    await expect(page.getByText("Online").first()).toBeVisible()
  })

  test("shows 'Presencial' badge for presential plans", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    await expect(page.getByText("Presencial").first()).toBeVisible()
  })

  test("shows formatted price", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    await expect(page.getByText("R$\u00a0299,90")).toBeVisible()
  })

  test("shows empty state when list is empty", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.empty)

    await expect(page.getByText("Nenhum plano cadastrado")).toBeVisible()
  })
})

// =============================================================================
// Create
// =============================================================================

test.describe("Service Plans — Create", () => {
  test("opens create dialog when clicking create button", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    await page.getByTestId("create-plan-button").click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Novo plano de serviço" })).toBeVisible()
  })

  test("creates a plan and shows it in the list", async ({ page }) => {
    const newPlan = {
      id: "plan-new-1",
      tenantId: "mock-tenant-abc123",
      name: "Plano Elite",
      description: "Treino exclusivo",
      price: "799.90",
      sessionsPerWeek: 5,
      durationMinutes: 120,
      attendanceType: "presential",
      isActive: true,
      createdAt: "2024-04-01T00:00:00Z",
      updatedAt: "2024-04-01T00:00:00Z",
    }

    await injectMockAuth(page)
    await mockServicePlansListStateful(
      page,
      servicePlansFixtures.withPlans,
      servicePlansFixtures.afterCreate(newPlan)
    )
    await mockCreateServicePlan(page, newPlan)
    await page.goto("/services")
    await page.waitForSelector("[data-testid='service-plans-list']", { timeout: 8000 })

    await page.getByTestId("create-plan-button").click()
    await page.getByRole("dialog").waitFor()

    await page.getByLabel("Nome").fill("Plano Elite")
    // Currency input is bank-style: type digits via keyboard (79990 = R$ 799,90)
    await page.getByLabel("Preço").click()
    await page.keyboard.type("79990")
    await page.getByRole("button", { name: "Salvar" }).click()

    await expect(page.getByText("Plano Elite")).toBeVisible({ timeout: 5000 })
    await expect(page.getByText("Plano criado com sucesso!")).toBeVisible()
  })

  test("shows empty state create button that opens dialog", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.empty)

    // There should be a create button in the empty state
    const createButtons = page.getByRole("button", { name: "Criar plano" })
    await expect(createButtons.first()).toBeVisible()
    await createButtons.first().click()
    await expect(page.getByRole("dialog")).toBeVisible()
  })
})

// =============================================================================
// Edit
// =============================================================================

test.describe("Service Plans — Edit", () => {
  test("opens edit dialog pre-populated with plan data", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    // Hover to reveal actions, then click edit
    const card = page.getByTestId("service-plan-card").first()
    await card.hover()
    await card.getByTestId("service-plan-actions").click()
    await page.getByTestId("edit-service-plan").click()

    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Editar plano" })).toBeVisible()
    await expect(page.getByLabel("Nome")).toHaveValue(onlinePlan.name)
  })

  test("updates a plan and shows updated data in list", async ({ page }) => {
    const updatedPlan = { ...onlinePlan, name: "Consultoria Online Premium", price: "399.90" }

    await injectMockAuth(page)
    await mockServicePlansListStateful(
      page,
      servicePlansFixtures.withPlans,
      [updatedPlan, presentialPlan]
    )
    await mockUpdateServicePlan(page, updatedPlan)
    await page.goto("/services")
    await page.waitForSelector("[data-testid='service-plans-list']", { timeout: 8000 })

    const card = page.getByTestId("service-plan-card").first()
    await card.hover()
    await card.getByTestId("service-plan-actions").click()
    await page.getByTestId("edit-service-plan").click()

    await page.getByRole("dialog").waitFor()
    await page.getByLabel("Nome").fill("Consultoria Online Premium")
    await page.getByRole("button", { name: "Salvar" }).click()

    await expect(page.getByText("Consultoria Online Premium")).toBeVisible({ timeout: 5000 })
    await expect(page.getByText("Plano atualizado com sucesso!")).toBeVisible()
  })
})

// =============================================================================
// Delete
// =============================================================================

test.describe("Service Plans — Delete", () => {
  test("opens delete confirmation dialog", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    const card = page.getByTestId("service-plan-card").first()
    await card.hover()
    await card.getByTestId("service-plan-actions").click()
    await page.getByTestId("delete-service-plan").click()

    await expect(page.getByTestId("delete-service-plan-dialog")).toBeVisible()
    await expect(page.getByText("Excluir plano")).toBeVisible()
  })

  test("deletes a plan and removes it from the list", async ({ page }) => {
    await injectMockAuth(page)
    await mockServicePlansListStateful(
      page,
      servicePlansFixtures.withPlans,
      servicePlansFixtures.afterDelete
    )
    await mockDeleteServicePlan(page)
    await page.goto("/services")
    await page.waitForSelector("[data-testid='service-plans-list']", { timeout: 8000 })

    const card = page.getByTestId("service-plan-card").nth(1) // presential plan (second)
    await card.hover()
    await card.getByTestId("service-plan-actions").click()
    await page.getByTestId("delete-service-plan").click()

    await page.getByTestId("delete-service-plan-dialog").waitFor()
    await page.getByRole("button", { name: "Excluir" }).click()

    await expect(page.getByText("Personal Presencial")).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText("Plano removido com sucesso!")).toBeVisible()
  })

  test("cancels deletion when clicking cancel", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    const card = page.getByTestId("service-plan-card").first()
    await card.hover()
    await card.getByTestId("service-plan-actions").click()
    await page.getByTestId("delete-service-plan").click()

    await page.getByTestId("delete-service-plan-dialog").waitFor()
    await page.getByRole("button", { name: "Cancelar" }).click()

    await expect(page.getByText("Consultoria Online")).toBeVisible()
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Service Plans — Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("shows plans list on mobile", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    await expect(page.getByRole("heading", { name: "Planos de Serviço" })).toBeVisible()
    await expect(page.getByText("Consultoria Online")).toBeVisible()
  })

  test("shows empty state on mobile", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.empty)

    await expect(page.getByText("Nenhum plano cadastrado")).toBeVisible()
  })

  test("opens create dialog on mobile", async ({ page }) => {
    await setupPage(page, servicePlansFixtures.withPlans)

    await page.getByTestId("create-plan-button").click()
    await expect(page.getByRole("dialog")).toBeVisible()
  })
})
