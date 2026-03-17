/**
 * Student Programs — Smoke Tests
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

const API_URL = "http://localhost:3000/api/v1"

async function createStudent(request: import("@playwright/test").APIRequestContext, accessToken: string) {
  const response = await request.post(`${API_URL}/students`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      name: `Smoke Student ${Date.now()}`,
      email: `smoke-student-${Date.now()}@e2e.test`,
    },
  })
  const body = await response.json()
  return body.data ?? body
}

async function createProgramTemplate(
  request: import("@playwright/test").APIRequestContext,
  accessToken: string
) {
  const response = await request.post(`${API_URL}/program-templates`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { name: `Smoke Template ${Date.now()}` },
  })
  const body = await response.json()
  return body.data ?? body
}

test.describe("Student Programs — Smoke @smoke", () => {
  test("coach can navigate to student programs tab", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    const student = await createStudent(request, coach.accessToken)
    await page.goto(`/students/${student.id}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 10000 })

    await page.getByRole("tab", { name: "Programas" }).click()
    await expect(page.getByTestId("assign-program-button")).toBeVisible()
    await expect(page.getByText("Nenhum programa")).toBeVisible()
  })

  test("coach can assign a program to a student and view it", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    const student = await createStudent(request, coach.accessToken)
    const template = await createProgramTemplate(request, coach.accessToken)

    await page.goto(`/students/${student.id}`)
    await page.waitForSelector("[data-slot='tabs']", { timeout: 10000 })
    await page.getByRole("tab", { name: "Programas" }).click()
    await page.getByTestId("assign-program-button").click()

    // Select template → auto-fills name
    await page.getByTestId("template-select").click()
    await page.getByRole("option", { name: template.name }).click()

    await page.getByTestId("assign-program-submit").click()
    await expect(page.getByText("Programa atribuído com sucesso!")).toBeVisible()

    // Program card should appear
    await expect(page.getByTestId("student-program-card")).toBeVisible()
  })
})
