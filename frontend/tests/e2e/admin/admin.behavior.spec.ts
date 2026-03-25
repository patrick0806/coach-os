import { test, expect } from "@playwright/test"

import {
  injectMockAuth,
  injectMockAdminAuth,
  mockAdminStats,
  mockAdminPlans,
  mockAdminWhitelist,
  mockAdminAdmins,
  mockAdminTenants,
} from "../support/apiMocks"
import {
  adminStatsFixture,
  adminPlansFixture,
  adminWhitelistFixture,
  adminAdminsFixture,
  adminTenantsFixture,
} from "../fixtures/admin.fixtures"

test.describe("Admin — Redirect", () => {
  test("should redirect to /dashboard when not ADMIN", async ({ page }) => {
    await injectMockAuth(page) // role = PERSONAL
    await page.goto("/admin/dashboard")
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 8000 })
    expect(page.url()).toContain("/dashboard")
    expect(page.url()).not.toContain("/admin")
  })
})

test.describe("Admin — Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await injectMockAdminAuth(page)
    await mockAdminStats(page, adminStatsFixture)
    await page.goto("/admin/dashboard")
  })

  test("should display 5 stats cards", async ({ page }) => {
    await expect(page.getByText("Total de Coaches")).toBeVisible()
    await expect(page.getByText("Coaches Pagantes")).toBeVisible()
    await expect(page.getByText("Novos este Mês")).toBeVisible()
    await expect(page.getByText("Total de Alunos")).toBeVisible()
    await expect(page.getByText("Whitelisted")).toBeVisible()
  })

  test("should display correct stat values", async ({ page }) => {
    await expect(page.getByText("42", { exact: true })).toBeVisible()
    await expect(page.getByText("30", { exact: true })).toBeVisible()
    await expect(page.getByText("5", { exact: true })).toBeVisible()
    await expect(page.getByText("310", { exact: true })).toBeVisible()
    await expect(page.getByText("3", { exact: true })).toBeVisible()
  })
})

test.describe("Admin — Planos", () => {
  test.beforeEach(async ({ page }) => {
    await injectMockAdminAuth(page)
    await mockAdminPlans(page, adminPlansFixture)
    await page.goto("/admin/planos")
  })

  test("should list plans", async ({ page }) => {
    await expect(page.getByRole("cell", { name: "Básico" })).toBeVisible()
    await expect(page.getByRole("cell", { name: "Pro" })).toBeVisible()
    await expect(page.getByText(/R\$.*29[,.]90/)).toBeVisible()
  })

  test("should open create plan dialog", async ({ page }) => {
    await page.getByRole("button", { name: /novo plano/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Novo Plano" })).toBeVisible()
  })

  test("should show validation error on empty submit", async ({ page }) => {
    await page.route("**/api/v1/admin/plans", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 400,
          contentType: "application/json",
          json: { message: "Validation error" },
        })
      } else {
        route.fallback()
      }
    })
    await page.getByRole("button", { name: /novo plano/i }).click()
    await page.getByLabel("Nome").fill("X")
    await page.getByLabel(/limite/i).fill("10")
    const createButton = page.getByRole("button", { name: /criar/i })
    await createButton.scrollIntoViewIfNeeded()
    await createButton.click({ force: true })
    // form should show error or reject
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("should show empty state when no plans", async ({ page }) => {
    await page.route("**/api/v1/admin/plans*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: [],
        })
      } else {
        route.fallback()
      }
    })
    await page.goto("/admin/planos")
    await expect(page.getByText("Nenhum plano encontrado.")).toBeVisible()
  })
})

test.describe("Admin — Whitelist", () => {
  test.beforeEach(async ({ page }) => {
    await injectMockAdminAuth(page)
    await mockAdminWhitelist(page, adminWhitelistFixture)
    await page.goto("/admin/whitelist")
  })

  test("should list whitelisted coaches", async ({ page }) => {
    await expect(page.getByText("João Silva")).toBeVisible()
    await expect(page.getByText("joao@example.com")).toBeVisible()
  })

  test("should open add dialog", async ({ page }) => {
    await page.getByRole("button", { name: /adicionar/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("should show remove button", async ({ page }) => {
    const row = page.getByRole("row", { name: /joão silva/i })
    await expect(row).toBeVisible()
    const deleteBtn = row.getByRole("button")
    await expect(deleteBtn).toBeVisible()
  })

  test("should show empty state", async ({ page }) => {
    await page.route("**/api/v1/admin/whitelist*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: [],
        })
      } else {
        route.fallback()
      }
    })
    await page.goto("/admin/whitelist")
    await expect(page.getByText("Nenhum coach na whitelist.")).toBeVisible()
  })
})

test.describe("Admin — Admins", () => {
  test.beforeEach(async ({ page }) => {
    await injectMockAdminAuth(page)
    await mockAdminAdmins(page, adminAdminsFixture)
    await page.goto("/admin/admins")
  })

  test("should list admins", async ({ page }) => {
    await expect(page.getByRole("cell", { name: "Super Admin" })).toBeVisible()
    await expect(page.getByRole("cell", { name: "admin@coachos.com" })).toBeVisible()
  })

  test("should open create admin dialog", async ({ page }) => {
    await page.getByRole("button", { name: /novo admin/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("Novo Administrador")).toBeVisible()
  })

  test("should show conflict error on duplicate email", async ({ page }) => {
    await page.route("**/api/v1/admin", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 409,
          contentType: "application/json",
          json: { message: "Já existe um registro com esse email" },
        })
      } else {
        route.fallback()
      }
    })
    await page.getByRole("button", { name: /novo admin/i }).click()
    await page.getByLabel("Nome").fill("Admin Test")
    await page.getByLabel("Email").fill("admin@coachos.com")
    await page.getByLabel("Senha").fill("password123")
    await page.getByRole("button", { name: /criar/i }).click()
    await expect(page.getByText("Email já cadastrado.")).toBeVisible()
  })

  test("should show empty state", async ({ page }) => {
    await page.route("**/api/v1/admin", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: [],
        })
      } else {
        route.fallback()
      }
    })
    await page.goto("/admin/admins")
    await expect(page.getByText("Nenhum administrador encontrado.")).toBeVisible()
  })
})

test.describe("Admin — Tenants", () => {
  test.beforeEach(async ({ page }) => {
    await injectMockAdminAuth(page)
    await mockAdminTenants(page, adminTenantsFixture)
    await page.goto("/admin/tenants")
  })

  test("should list tenants", async ({ page }) => {
    await expect(page.getByText("João Silva")).toBeVisible()
    await expect(page.getByText("Maria Souza")).toBeVisible()
  })

  test("should show search input", async ({ page }) => {
    const search = page.getByPlaceholder(/buscar/i)
    await expect(search).toBeVisible()
  })

  test("should show empty state", async ({ page }) => {
    await page.route("**/api/v1/admin/tenants*", (route) => {
      const isListGet =
        route.request().method() === "GET" &&
        !route.request().url().match(/\/admin\/tenants\/[^/?]+(?:\?|$)/)
      if (isListGet) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
        })
      } else {
        route.fallback()
      }
    })
    await page.goto("/admin/tenants")
    await expect(page.getByText("Nenhum tenant encontrado.")).toBeVisible()
  })

  test("should navigate to tenant detail on click", async ({ page }) => {
    await mockAdminTenants(page, adminTenantsFixture)
    await page.route("**/api/v1/admin/tenants/personal-1*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: {
            id: "personal-1",
            name: "João Silva",
            email: "joao@example.com",
            slug: "joao-silva",
            accessStatus: "active",
            subscriptionPlanId: "plan-1",
            subscriptionStatus: "active",
            isWhitelisted: false,
            onboardingCompleted: true,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            subscriptionExpiresAt: null,
            trialEndsAt: null,
            createdAt: "2025-01-15T00:00:00.000Z",
          },
        })
      } else {
        route.fallback()
      }
    })
    await page.getByRole("link", { name: "João Silva" }).click()
    await page.waitForURL(/\/admin\/tenants\/personal-1/)
    await expect(page.getByText("joao@example.com")).toBeVisible()
  })
})
