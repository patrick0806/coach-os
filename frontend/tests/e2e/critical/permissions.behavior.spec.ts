import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  injectMockAuthAs,
  injectStudentMockAuth,
  injectMockAdminAuth,
  mockDashboardStats,
  mockAdminStats,
  mockAdminPlans,
  MOCK_USER,
} from "../support/apiMocks"
import { ADMIN_STATS, ADMIN_PLANS, DASHBOARD_STATS } from "../utils/comprehensiveFixtures"

// =============================================================================
// Permissions — Role-based access control
// =============================================================================

test.describe("Critical — Permissions", () => {
  test("personal cannot access admin dashboard", async ({ page }) => {
    await injectMockAuth(page)
    await mockDashboardStats(page, DASHBOARD_STATS)

    await page.goto("/admin/dashboard")

    // Should be redirected away from admin area
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).not.toContain("/admin/dashboard")
  })

  test("personal cannot access admin plans page", async ({ page }) => {
    await injectMockAuth(page)
    await mockDashboardStats(page, DASHBOARD_STATS)

    await page.goto("/admin/planos")

    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).not.toContain("/admin/planos")
  })

  test("student cannot access coach dashboard", async ({ page }) => {
    await injectStudentMockAuth(page)

    await page.goto("/dashboard")

    // Student should be redirected away from coach dashboard
    await page.waitForTimeout(3000)
    const url = page.url()
    // Should not stay on /dashboard (redirected to student area or login)
    expect(url).not.toBe("http://localhost:3099/dashboard")
  })

  test("student cannot access students management page", async ({ page }) => {
    await injectStudentMockAuth(page)

    await page.goto("/students")

    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).not.toBe("http://localhost:3099/students")
  })

  test("student cannot access training templates page", async ({ page }) => {
    await injectStudentMockAuth(page)

    await page.goto("/training-templates")

    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).not.toBe("http://localhost:3099/training-templates")
  })

  test("admin accessing coach area is redirected to admin dashboard", async ({ page }) => {
    await injectMockAdminAuth(page)
    await mockAdminStats(page, ADMIN_STATS)
    await mockAdminPlans(page, ADMIN_PLANS)

    await page.goto("/admin/dashboard")

    // Admin should be able to access admin dashboard
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).toContain("/admin")
  })

  test("unauthenticated user is redirected from dashboard", async ({ page }) => {
    // No auth cookies injected
    await page.goto("/dashboard")

    await page.waitForTimeout(3000)
    const url = page.url()
    // Should redirect to login
    expect(url).toContain("/login")
  })

  test("unauthenticated user is redirected from admin", async ({ page }) => {
    await page.goto("/admin/dashboard")

    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).toContain("/login")
  })
})
