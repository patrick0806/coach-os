/**
 * Student Portal — Smoke Tests @smoke
 *
 * Tests that require a real backend:
 * - Public page rendering (server component, cannot be tested with behavior tests)
 * - Student login form on branded sub-route
 *
 * Run with: npx playwright test --project=smoke
 */
import { test, expect } from "@playwright/test"
import { createIsolatedCoach } from "../support/testIsolation"

const API_URL = "http://localhost:3000/api/v1"

async function getCoachSlug(
  request: import("@playwright/test").APIRequestContext,
  accessToken: string
): Promise<string> {
  const res = await request.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const body = await res.json()
  const profile = body.data ?? body
  return profile.slug
}

test.describe("Student Portal — Public Page @smoke", () => {
  test("public page renders with coach name", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    const slug = await getCoachSlug(request, coach.accessToken)

    await page.goto(`/personais/${slug}`)
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    // Coach name should appear on the public page
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("public page renders Ver planos button", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    const slug = await getCoachSlug(request, coach.accessToken)

    await page.goto(`/personais/${slug}`)
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    await expect(page.getByText("Ver planos")).toBeVisible()
  })

  test("public page renders Entrar como aluno button", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    const slug = await getCoachSlug(request, coach.accessToken)

    await page.goto(`/personais/${slug}`)
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    await expect(page.getByText("Entrar como aluno")).toBeVisible()
  })

  test("clicking Entrar como aluno navigates to branded login page", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    const slug = await getCoachSlug(request, coach.accessToken)

    await page.goto(`/personais/${slug}`)
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    await page.getByText("Entrar como aluno").click()
    await page.waitForURL(`**/personais/${slug}/login`, { timeout: 8000 })

    // Login form appears (with coach branding)
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible({ timeout: 8000 })
  })

  test("student login page shows branded form with coach profile", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    const slug = await getCoachSlug(request, coach.accessToken)

    await page.goto(`/personais/${slug}/login`)
    await page.waitForLoadState("networkidle", { timeout: 15000 })

    // Should show login form (not the "not found" fallback)
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible({
      timeout: 8000,
    })
    await expect(page.locator("input[type='password']")).toBeVisible()
    await expect(page.getByText("Treinador não encontrado")).not.toBeVisible()
  })
})
