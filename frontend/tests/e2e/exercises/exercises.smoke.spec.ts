/**
 * Exercise Library — Smoke Tests
 *
 * These tests run against the real backend. Each test creates an isolated
 * coach account via registration (unique UUID email) so runs never share state.
 *
 * Run these only when the full stack is available:
 *   npx playwright test --grep @smoke
 *
 * Data isolation: each coach has its own tenantId — no cross-contamination.
 * Cleanup: no delete-account API exists; data accumulates but stays isolated.
 */
import { test, expect } from "@playwright/test"
import { createIsolatedCoach, injectCoachSession } from "../support/testIsolation"

test.describe("Exercise Library — Smoke @smoke", () => {
  test("authenticated coach can access the exercises page", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 10000 })

    await expect(page.getByRole("heading", { name: "Exercícios" })).toBeVisible()
    // Global exercises are seeded — at least one "Plataforma" badge should appear
    await expect(page.getByText("Plataforma").first()).toBeVisible()
  })

  test("coach can create and then find a private exercise @smoke", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 10000 })

    // Create a private exercise
    const exerciseName = `Smoke Test Exercise ${Date.now()}`
    await page.getByRole("button", { name: "Criar exercício" }).click()
    await expect(page.getByRole("heading", { name: "Novo exercício" })).toBeVisible()

    await page.locator("#exercise-name").fill(exerciseName)
    await page.locator("#exercise-muscleGroup").click()
    await page.getByRole("option", { name: "Peitoral" }).click()
    await page.getByRole("button", { name: "Salvar" }).click()

    await expect(page.getByRole("heading", { name: "Novo exercício" })).not.toBeVisible()

    // Exercise should appear in the grid with "Meu" badge
    await expect(page.getByText(exerciseName)).toBeVisible()
    await expect(page.getByText("Meu")).toBeVisible()
  })
})
