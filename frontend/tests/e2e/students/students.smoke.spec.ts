/**
 * Students — Smoke Tests @smoke
 *
 * Full create student flow against a real backend.
 * Each test uses an isolated coach account to avoid data accumulation.
 * Run with: npx playwright test --project=smoke
 */
import { test, expect } from "@playwright/test"
import { createIsolatedCoach, injectCoachSession } from "../support/testIsolation"
import { generateUniqueName, generateUniqueEmail } from "../helpers"

test.describe("Students — Smoke @smoke", () => {
  test("authenticated coach can access and see the students page", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    await expect(page.getByRole("button", { name: "Novo aluno" })).toBeVisible()
  })

  test("coach can create a student and find them in the list", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    const studentName = generateUniqueName()
    const studentEmail = generateUniqueEmail()

    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })

    await page.getByRole("button", { name: "Novo aluno" }).click()
    await expect(page.getByRole("heading", { name: "Novo aluno" })).toBeVisible()

    await page.locator("#name").fill(studentName)
    await page.locator("#email").fill(studentEmail)

    await page.getByRole("button", { name: "Salvar" }).click()

    await expect(page.getByRole("heading", { name: "Novo aluno" })).not.toBeVisible()
    await expect(page.getByText(studentName)).toBeVisible()
  })
})
