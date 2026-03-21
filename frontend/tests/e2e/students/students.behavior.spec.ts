/**
 * Students — Behavioral Tests
 *
 * All API calls are mocked via page.route(). No backend required.
 * Deterministic regardless of accumulated data in the database.
 */
import { test, expect } from "@playwright/test"
import {
  injectMockAuth,
  mockStudentsList,
  mockStudentsListStateful,
  mockCreateStudent,
  mockGenerateInviteLink,
  mockGenerateStudentAccessLink,
  mockServicePlansList,
} from "../support/apiMocks"
import {
  studentsFixtures,
  newStudentFixture,
  activeStudents,
} from "../fixtures/students.fixtures"

// --- Setup helpers ---

async function setupPage(page: import("@playwright/test").Page, listFixture: object) {
  await injectMockAuth(page)
  await mockStudentsList(page, listFixture)
  await page.goto("/students")
  await page.locator("table").waitFor({ state: "visible", timeout: 8000 })
}

// =============================================================================
// List & Filters
// =============================================================================

test.describe("Students — List & Filters", () => {
  test("shows student names in the table", async ({ page }) => {
    await setupPage(page, studentsFixtures.active)

    for (const student of activeStudents) {
      await expect(page.getByText(student.name)).toBeVisible()
    }
  })

  test("search input updates the URL and filters are reflected", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentsList(page, studentsFixtures.fernandaSearch)
    await page.goto("/students?search=Fernanda")
    await page.locator("table").waitFor({ state: "visible", timeout: 8000 })

    await expect(page.getByText("Fernanda Costa")).toBeVisible()
    await expect(page.getByText("Carlos Mendonça")).not.toBeVisible()
  })

  test("search input updates URL with debounce", async ({ page }) => {
    await setupPage(page, studentsFixtures.active)

    await page.getByPlaceholder("Buscar por nome ou email...").fill("Fernanda")
    await page.waitForURL(/search=Fernanda/, { timeout: 5000 })

    expect(page.url()).toContain("search=Fernanda")
  })

  test("Ativos tab filters by active status", async ({ page }) => {
    await setupPage(page, studentsFixtures.active)

    await page.getByRole("tab", { name: "Ativos" }).click()
    await page.waitForURL(/status=active/)

    for (const student of activeStudents) {
      await expect(page.getByText(student.name)).toBeVisible()
    }
  })

  test("Arquivados tab shows empty state when no archived students", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentsList(page, studentsFixtures.archived)
    await page.goto("/students?status=archived")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 8000 })

    await expect(page.getByText("Nenhum aluno encontrado")).toBeVisible()
  })
})

// =============================================================================
// Create Student
// =============================================================================

test.describe("Students — Create", () => {
  test("opens create dialog when clicking 'Novo aluno'", async ({ page }) => {
    await setupPage(page, studentsFixtures.active)

    await page.getByRole("button", { name: "Novo aluno" }).click()

    await expect(page.getByRole("heading", { name: "Novo aluno" })).toBeVisible()
    await expect(page.locator("#name")).toBeVisible()
    await expect(page.locator("#email")).toBeVisible()
  })

  test("closes dialog and shows new student after creation", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentsListStateful(
      page,
      studentsFixtures.active,
      studentsFixtures.afterCreate(newStudentFixture)
    )
    await mockCreateStudent(page, newStudentFixture)
    await mockServicePlansList(page, [])
    await page.goto("/students")
    await page.locator("table").waitFor({ state: "visible", timeout: 8000 })

    await page.getByRole("button", { name: "Novo aluno" }).click()
    await expect(page.getByRole("heading", { name: "Novo aluno" })).toBeVisible()

    await page.locator("#name").fill(newStudentFixture.name)
    await page.locator("#email").fill(newStudentFixture.email)

    await page.getByRole("button", { name: "Salvar" }).click()

    // Dialog closes on success
    await expect(page.getByRole("heading", { name: "Novo aluno" })).not.toBeVisible()

    // New student appears after refetch
    await expect(page.getByText(newStudentFixture.name)).toBeVisible()
  })
})

// =============================================================================
// Invite Link
// =============================================================================

test.describe("Students — Invite Link", () => {
  test("generates and displays an invite link via row actions", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentsList(page, studentsFixtures.active)
    await mockGenerateStudentAccessLink(page)
    await page.goto("/students")
    await page.locator("table").waitFor({ state: "visible", timeout: 8000 })

    // Open invite dialog via row actions menu (3 dots)
    await page.locator('[data-tour="student-row-actions"]').first().click()
    await page.getByRole("menuitem", { name: "Enviar convite" }).click()
    await expect(page.getByRole("heading", { name: /Convidar/i })).toBeVisible()

    await page.getByRole("button", { name: "Gerar link" }).click()

    // Link step renders
    await expect(page.getByText("Compartilhe este link")).toBeVisible()

    const linkText = page.locator("p.font-mono")
    await expect(linkText).toBeVisible()
    await expect(linkText).not.toBeEmpty()
  })

  test("copy link button shows 'Copiado!' feedback", async ({ page }) => {
    await injectMockAuth(page)
    await mockStudentsList(page, studentsFixtures.active)
    await mockGenerateStudentAccessLink(page)
    await page.goto("/students")
    await page.locator("table").waitFor({ state: "visible", timeout: 8000 })

    // Open invite dialog via row actions menu (3 dots)
    await page.locator('[data-tour="student-row-actions"]').first().click()
    await page.getByRole("menuitem", { name: "Enviar convite" }).click()
    await page.getByRole("button", { name: "Gerar link" }).click()

    await expect(page.getByText("Compartilhe este link")).toBeVisible()

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
    await page.getByRole("button", { name: "Copiar link" }).click()
    await expect(page.getByText("Copiado!")).toBeVisible()
  })
})

// =============================================================================
// Mobile
// =============================================================================

test.describe("Students — Mobile", () => {
  test.use({ viewport: { width: 412, height: 915 } })

  test("student table renders on mobile", async ({ page }) => {
    await setupPage(page, studentsFixtures.active)

    await expect(page.locator("table")).toBeVisible()

    // "Cadastrado em" column is hidden on small screens
    const registeredHeader = page.getByRole("columnheader", { name: "Cadastrado em" })
    await expect(registeredHeader).not.toBeVisible()

    await expect(page.getByText("Fernanda Costa")).toBeVisible()
  })

  test("create dialog opens on mobile", async ({ page }) => {
    await setupPage(page, studentsFixtures.active)

    await page.getByRole("button", { name: "Novo aluno" }).click()
    await expect(page.getByRole("heading", { name: "Novo aluno" })).toBeVisible()
    await expect(page.locator("#name")).toBeVisible()
    await expect(page.locator("#email")).toBeVisible()
  })
})
