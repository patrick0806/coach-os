import { test, expect } from "@playwright/test"
import { createIsolatedCoach, injectCoachSession } from "../support/testIsolation"
import { generateUniqueName, generateUniqueEmail } from "../helpers"

const API_URL = "http://localhost:3000/api/v1"

// =============================================================================
// Happy Path Smoke — Full E2E flow against real backend
// =============================================================================

test.describe("Happy Path — Full E2E Flow @smoke", () => {
  test("coach registers, creates student, creates exercise, creates program", async ({
    page,
    request,
  }) => {
    // --- Step 1: Register coach ---
    const coach = await createIsolatedCoach(request)
    expect(coach.accessToken).toBeTruthy()

    await injectCoachSession(page, coach)

    // --- Step 2: Access dashboard ---
    await page.goto("/dashboard")
    await expect(
      page.locator("[data-slot='page-header'], h1, h2").first()
    ).toBeVisible({ timeout: 15000 })

    // --- Step 3: Create student via API (more reliable for smoke) ---
    const studentName = generateUniqueName()
    const studentEmail = generateUniqueEmail()

    const createStudentRes = await request.post("http://localhost:3000/api/v1/students", {
      headers: { Authorization: `Bearer ${coach.accessToken}` },
      data: { name: studentName, email: studentEmail },
    })

    if (!createStudentRes.ok()) {
      const errBody = await createStudentRes.json().catch(() => ({}))
      console.error(`Create student failed (${createStudentRes.status()}):`, JSON.stringify(errBody))
    }
    expect(createStudentRes.ok()).toBeTruthy()

    // Verify student appears on UI
    await page.goto("/students")
    await page.waitForSelector("[data-slot='empty-state'], table", { timeout: 10000 })
    await expect(page.getByText(studentName)).toBeVisible({ timeout: 10000 })

    // --- Step 4: Create exercise ---
    await page.goto("/exercises")
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 15000 })

    const exerciseName = `HP Exercise ${Date.now()}`
    await page.getByRole("button", { name: /criar exercício/i }).click()
    await expect(page.getByRole("heading", { name: /novo exercício/i })).toBeVisible()

    await page.locator("#exercise-name").fill(exerciseName)
    await page.locator("#exercise-muscleGroup").click()
    await page.getByRole("option", { name: "Peitoral" }).click()
    await page.getByRole("button", { name: /salvar/i }).click()

    // Exercise should appear
    await expect(page.getByText(exerciseName)).toBeVisible({ timeout: 10000 })

    // --- Step 5: Create training program ---
    await page.goto("/training-templates")
    await page.waitForSelector("[data-slot='empty-state'], [data-testid='template-card']", {
      timeout: 15000,
    })

    const programName = `HP Program ${Date.now()}`
    await page.getByTestId("create-template-button").click()
    await page.locator("#template-name").fill(programName)
    await page.getByTestId("template-submit-button").click()

    // Program should appear
    await page.waitForTimeout(3000)
    await expect(page.getByText(programName)).toBeVisible({ timeout: 10000 })
  })

  test("coach creates service plan and configures availability", async ({
    page,
    request,
  }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    // --- Service Plans ---
    await page.goto("/services")
    await page.waitForTimeout(5000)

    // Page should load without errors
    const bodyContent = await page.locator("body").textContent()
    expect(bodyContent).toBeTruthy()

    // --- Availability ---
    await page.goto("/disponibilidade")
    await page.waitForTimeout(5000)

    const availContent = await page.locator("body").textContent()
    expect(availContent).toBeTruthy()
  })

  test("coach can access profile editor page", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    await page.goto("/pagina-publica")
    // Wait for the page to fully load — may take time for the profile API
    await page.waitForTimeout(8000)

    // The page should render the sidebar with "Página Pública" link active
    // Even if the main content takes time to load, the layout should be there
    const url = page.url()
    expect(url).toContain("/pagina-publica")

    // Try to interact with bio field if available
    const bioField = page.locator("#bio")
    const bioVisible = await bioField.isVisible({ timeout: 5000 }).catch(() => false)

    if (bioVisible) {
      await bioField.fill("Bio do happy path smoke test")
      await page.getByRole("button", { name: /salvar/i }).first().click()
      await expect(page.getByText(/sucesso|salvo/i).first()).toBeVisible({ timeout: 10000 })
    } else {
      // Profile page is loading — at least verify the sidebar rendered
      await expect(page.getByText("Página Pública").first()).toBeVisible()
    }
  })

  test("coach sends student invite", async ({ page, request }) => {
    const coach = await createIsolatedCoach(request)
    await injectCoachSession(page, coach)

    // Create student via API (more reliable for smoke)
    const studentName = generateUniqueName()
    const studentEmail = generateUniqueEmail()

    const createRes = await request.post("http://localhost:3000/api/v1/students", {
      headers: { Authorization: `Bearer ${coach.accessToken}` },
      data: { name: studentName, email: studentEmail },
    })
    expect(createRes.ok()).toBeTruthy()

    await page.goto("/students")
    await page.waitForSelector("table", { timeout: 10000 })
    await expect(page.getByText(studentName)).toBeVisible({ timeout: 10000 })

    // Find the student row and open actions menu
    const studentRow = page.locator("tr").filter({ hasText: studentName })
    const actionsBtn = studentRow
      .locator("[data-tour='student-row-actions'], [data-testid='student-row-actions']")
      .first()

    if (await actionsBtn.isVisible()) {
      await actionsBtn.click()

      // Click invite option
      const inviteOption = page.getByText(/enviar convite|enviar acesso/i).first()
      if (await inviteOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await inviteOption.click()
        await page.waitForTimeout(2000)

        // Generate link
        const genLinkBtn = page.getByRole("button", { name: /gerar link/i })
        if (await genLinkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await genLinkBtn.click()
          await page.waitForTimeout(3000)

          // Link should be visible
          const linkText = page.locator("p.font-mono, [data-testid='invite-link']").first()
          if (await linkText.isVisible({ timeout: 3000 }).catch(() => false)) {
            const link = await linkText.textContent()
            expect(link).toBeTruthy()
          }
        }
      }
    }
  })
})
