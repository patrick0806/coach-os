import { test, expect } from "@playwright/test";
import { generateUniqueEmail, TEST_PASSWORD, TEST_USER } from "./helpers";

let registeredEmail: string;

test.describe("Auth Flow", () => {
  test.describe.configure({ mode: "serial" });

  test("register successfully", async ({ page }) => {
    registeredEmail = generateUniqueEmail();

    await page.goto("/cadastro");

    // Step 1: select a plan (planSelector uses plain <button> elements)
    const planButton = page.locator("button").filter({ hasText: /alunos/ });
    await planButton.first().waitFor({ timeout: 15000 });
    await planButton.first().click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 2: fill registration form
    await page.locator("#name").fill(TEST_USER.name);
    await page.locator("#email").fill(registeredEmail);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.locator("#confirmPassword").fill(TEST_PASSWORD);

    await page.getByRole("button", { name: "Criar conta" }).click();

    // Should redirect to dashboard without error toast
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    const errorToast = page.locator('[data-type="error"]');
    await expect(errorToast).toHaveCount(0);
  });

  test("login successfully", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill(registeredEmail);
    await page.locator("#password").fill(TEST_PASSWORD);

    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    const errorToast = page.locator('[data-type="error"]');
    await expect(errorToast).toHaveCount(0);
  });

  test("register with duplicate email shows error", async ({ page }) => {
    await page.goto("/cadastro");

    const planButton = page.locator("button").filter({ hasText: /alunos/ });
    await planButton.first().waitFor({ timeout: 15000 });
    await planButton.first().click();
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.locator("#name").fill(TEST_USER.name);
    await page.locator("#email").fill(registeredEmail);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.locator("#confirmPassword").fill(TEST_PASSWORD);

    await page.getByRole("button", { name: "Criar conta" }).click();

    // Should show an error toast (from API — email already exists)
    const errorToast = page.locator('[data-type="error"]');
    await expect(errorToast).toBeVisible({ timeout: 10000 });
  });

  test("login with invalid credentials stays on login", async ({ page, context }) => {
    // Clear cookies from previous tests to avoid auto-redirect
    await context.clearCookies();
    await page.goto("/login");

    await page.locator("#email").fill("nonexistent@test.com");
    await page.locator("#password").fill("WrongPass1");

    await page.getByRole("button", { name: "Entrar" }).click();

    // The 401 triggers the axios refresh interceptor which fails and redirects back to /login.
    // Verify user stays on login and does NOT reach dashboard.
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("forgot password shows success message (anti-enumeration)", async ({
    page,
  }) => {
    await page.goto("/esqueci-senha");

    await page.locator("#email").fill("any-email@test.com");
    await page.getByRole("button", { name: "Enviar instruções" }).click();

    // Should show success state regardless of email existence
    await expect(
      page.getByText("Verifique seu e-mail")
    ).toBeVisible({ timeout: 10000 });
  });
});
