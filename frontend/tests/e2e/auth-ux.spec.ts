import { test, expect } from "@playwright/test";

test.describe("Auth UX", () => {
  test("back to home link exists on auth pages", async ({ page }) => {
    for (const path of ["/login", "/cadastro", "/esqueci-senha"]) {
      await page.goto(path);
      const backLink = page.getByRole("link", { name: /Início/i });
      await expect(backLink).toBeVisible();
      expect(await backLink.getAttribute("href")).toBe("/");
    }
  });

  test("preselected plan shows badge on step 2", async ({ page }) => {
    // First, get a plan ID from the cadastro page
    await page.goto("/cadastro");
    await page.waitForSelector('[data-slot="plan-card"]');

    // Click first plan to proceed
    const firstPlan = page.locator('[data-slot="plan-card"]').first();
    const planName = await firstPlan.locator("h3, [class*='font-bold'], [class*='font-semibold']").first().textContent();
    await firstPlan.click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Verify selected plan info is shown on step 2
    if (planName) {
      await expect(page.getByText(planName)).toBeVisible();
    }
    // Price should be visible (R$ format)
    await expect(page.getByText(/R\$/)).toBeVisible();
  });

  test("password strength indicator changes with input", async ({ page }) => {
    await page.goto("/cadastro");
    await page.waitForSelector('[data-slot="plan-card"]');
    await page.locator('[data-slot="plan-card"]').first().click();
    await page.getByRole("button", { name: "Continuar" }).click();

    const passwordInput = page.locator("#password");

    // Weak password (just length)
    await passwordInput.fill("abcdefgh");
    await expect(page.getByText("Fraca")).toBeVisible();

    // Medium password (length + uppercase)
    await passwordInput.fill("Abcdefgh");
    await expect(page.getByText("Média")).toBeVisible();

    // Strong password (length + uppercase + number)
    await passwordInput.fill("Abcdefg1");
    await expect(page.getByText("Forte")).toBeVisible();
  });

  test("back to plan selection button works", async ({ page }) => {
    await page.goto("/cadastro");
    await page.waitForSelector('[data-slot="plan-card"]');
    await page.locator('[data-slot="plan-card"]').first().click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Should be on step 2
    await expect(page.locator("#name")).toBeVisible();

    // Click back button
    await page.getByRole("button", { name: /Escolher outro plano/i }).click();

    // Should be back on step 1 (plan selection)
    await expect(page.locator('[data-slot="plan-card"]').first()).toBeVisible();
  });
});
