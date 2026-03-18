import { test, expect } from "@playwright/test"
import { MOCK_STUDENT_USER, MOCK_COACH_PUBLIC } from "../fixtures/studentWorkout.fixtures"
import { injectStudentMockAuth } from "../support/apiMocks"

const COACH_SLUG = "joao-silva"
const LOGIN_URL = `/personais/${COACH_SLUG}/login`

const FAKE_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50LXVzZXIifQ.mock-student-sig"

test.describe("Student Login Page — behavioral", () => {
  test.beforeEach(async ({ page }) => {
    // Mock public profile endpoint — used by the server component that renders the login page
    await page.route(`**/public/${COACH_SLUG}*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { data: MOCK_COACH_PUBLIC },
        })
      } else {
        route.continue()
      }
    })
  })

  test("renders login form with email and password fields", async ({ page }) => {
    await page.goto(LOGIN_URL)

    await expect(page.getByTestId("email-input")).toBeVisible()
    await expect(page.getByTestId("password-input")).toBeVisible()
    await expect(page.getByTestId("submit-button")).toBeVisible()
  })

  test("shows coach branding on login page", async ({ page }) => {
    await page.goto(LOGIN_URL)

    // Coach name should appear in the heading
    await expect(page.getByText("João Silva", { exact: false })).toBeVisible()
  })

  test("successful login redirects to /aluno/treinos", async ({ page }) => {
    // Mock the login endpoint to return a valid student token
    await page.route("**/api/v1/auth/login*", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: {
            data: {
              accessToken: FAKE_ACCESS_TOKEN,
              user: MOCK_STUDENT_USER,
            },
          },
        })
      } else {
        route.continue()
      }
    })

    // Mock student programs for the /aluno/treinos page redirect
    await page.route(`**/api/v1/students/${MOCK_STUDENT_USER.id}/programs*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { content: [], page: 0, size: 50, totalElements: 0, totalPages: 1 },
        })
      } else {
        route.continue()
      }
    })

    await page.goto(LOGIN_URL)

    await page.getByTestId("email-input").fill("maria@student.com")
    await page.getByTestId("password-input").fill("Senha123!")
    await page.getByTestId("submit-button").click()

    await expect(page).toHaveURL(/\/aluno\/treinos/)
  })

  test("shows error toast on wrong credentials", async ({ page }) => {
    await page.route("**/api/v1/auth/login*", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          json: { message: "Email ou senha inválidos", statusCode: 401 },
        })
      } else {
        route.continue()
      }
    })

    await page.goto(LOGIN_URL)

    await page.getByTestId("email-input").fill("wrong@email.com")
    await page.getByTestId("password-input").fill("wrongpassword")
    await page.getByTestId("submit-button").click()

    // Should show error toast
    await expect(page.getByText("Email ou senha inválidos", { exact: false })).toBeVisible()
  })

  test("renders correctly on mobile viewport (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(LOGIN_URL)

    await expect(page.getByTestId("student-login-form")).toBeVisible()
    await expect(page.getByTestId("email-input")).toBeVisible()
    await expect(page.getByTestId("submit-button")).toBeVisible()
  })

  test("shows coach not found message for invalid slug", async ({ page }) => {
    await page.route("**/public/slug-invalido*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 404, contentType: "application/json", json: {} })
      } else {
        route.continue()
      }
    })

    await page.goto("/personais/slug-invalido/login")

    await expect(page.getByText("Treinador não encontrado", { exact: false })).toBeVisible()
  })
})

test.describe("Student auth redirect — behavioral", () => {
  test("authenticated student is redirected from login to /aluno/treinos", async ({ page }) => {
    // Inject student cookies to simulate authenticated session
    await injectStudentMockAuth(page)

    // Mock student programs
    await page.route(`**/api/v1/students/${MOCK_STUDENT_USER.id}/programs*`, (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          json: { content: [], page: 0, size: 50, totalElements: 0, totalPages: 1 },
        })
      } else {
        route.continue()
      }
    })

    await page.goto(LOGIN_URL)
    await expect(page).toHaveURL(/\/aluno\/treinos/)
  })
})
