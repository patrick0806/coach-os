/**
 * Training Templates — Smoke Tests @smoke
 *
 * Full template CRUD and builder interactions against a real backend.
 * Uses an isolated coach account per run to avoid data accumulation.
 * Run with: npx playwright test --project=smoke
 */
import { test, expect } from "@playwright/test"
import { createIsolatedCoach, injectCoachSession } from "../support/testIsolation"
import { generateUniqueName } from "../helpers"

test.describe("Training Templates — Smoke @smoke", () => {
  test.describe.configure({ mode: "serial" })

  let templateName: string

  test("coach can create a program template", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    templateName = `E2E Smoke ${generateUniqueName()}`

    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 10000,
    })

    await page.getByTestId("create-template-button").click()
    await expect(page.getByRole("heading", { name: "Novo programa" })).toBeVisible()

    await page.getByTestId("template-name-input").fill(templateName)
    await page.getByTestId("template-submit-button").click()

    await expect(page.getByRole("heading", { name: "Novo programa" })).not.toBeVisible()
    await expect(page.getByText(templateName)).toBeVisible()
  })

  test("coach can navigate to builder and add a workout", async ({ page, request }) => {
    if (!templateName) test.skip()

    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    // Create a fresh template for this test
    const freshName = `E2E Builder ${generateUniqueName()}`

    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 10000,
    })

    await page.getByTestId("create-template-button").click()
    await page.getByTestId("template-name-input").fill(freshName)
    await page.getByTestId("template-submit-button").click()
    await expect(page.getByText(freshName)).toBeVisible()

    // Navigate to builder
    const card = page.getByTestId("template-card").filter({ hasText: freshName }).first()
    await card.getByTestId("template-name-link").click()

    await expect(page).toHaveURL(/training-templates\//)

    await page.waitForSelector("[data-slot='empty-state'], [data-testid='workout-template-card']", {
      timeout: 8000,
    })

    // Add first workout
    await page.getByTestId("add-first-workout-button").click()
    await expect(page.getByRole("heading", { name: "Novo treino" })).toBeVisible()

    await page.getByTestId("workout-name-input").fill("Treino A - Peito")
    await page.getByTestId("workout-submit-button").click()

    await expect(page.getByRole("heading", { name: "Novo treino" })).not.toBeVisible()
    await expect(page.getByText("Treino A - Peito")).toBeVisible()
  })
})
