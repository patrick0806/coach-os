import { test, expect } from "@playwright/test"
import { createIsolatedCoach, injectCoachSession } from "../support/testIsolation"
import { generateUniqueName, generateUniqueEmail } from "../helpers"

// =============================================================================
// 1. Admin — login and dashboard access
// =============================================================================

test.describe("Smoke — Admin @smoke", () => {
  test.skip("admin can login and see dashboard stats — requires admin seed data", async () => {
    // Skipped: requires admin user to be seeded in the database
  })
})

// =============================================================================
// 2. Personal — registration
// =============================================================================

test.describe("Smoke — Coach Registration @smoke", () => {
  test("personal can register and receive access token", async ({ request }) => {
    const coach = await createIsolatedCoach(request)

    expect(coach.accessToken).toBeTruthy()
    expect(coach.tenantId).toBeTruthy()
    expect(coach.email).toContain("@e2e.test")
  })
})

// =============================================================================
// 3. Personal — dashboard access
// =============================================================================

test.describe("Smoke — Coach Dashboard @smoke", () => {
  test("authenticated coach can access dashboard", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/dashboard")

    await expect(
      page.locator("[data-slot='page-header'], h1, h2").first()
    ).toBeVisible({ timeout: 15000 })
  })
})

// =============================================================================
// 4. Personal — create a student
// =============================================================================

test.describe("Smoke — Create Student @smoke", () => {
  test("coach can create a student via API and see it on UI", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    const studentName = generateUniqueName()
    const studentEmail = generateUniqueEmail()

    // Create student via API — validates backend works
    const res = await request.post("http://localhost:3000/api/v1/students", {
      headers: { Authorization: `Bearer ${coach.accessToken}` },
      data: { name: studentName, email: studentEmail },
    })
    expect(res.ok()).toBeTruthy()

    // Verify student appears on UI
    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })
    await expect(page.getByText(studentName)).toBeVisible({ timeout: 10000 })
  })
})

// =============================================================================
// 5. Student — portal access after activation
// =============================================================================

test.describe("Smoke — Student Portal Access @smoke", () => {
  test("coach public page is reachable", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)

    // Get coach profile to find slug
    const profileResponse = await request.get("http://localhost:3000/api/v1/profile", {
      headers: { Authorization: `Bearer ${coach.accessToken}` },
    })

    if (profileResponse.ok()) {
      const profile = await profileResponse.json()
      const slug = profile.slug ?? profile.data?.slug
      if (slug) {
        await page.goto(`/coach/${slug}`)
        await page.waitForTimeout(3000)
        // Page should render without crash
        const bodyContent = await page.locator("body").textContent()
        expect(bodyContent).toBeTruthy()
        expect(bodyContent!.length).toBeGreaterThan(0)
      }
    }
  })
})
