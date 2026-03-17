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
    await page.goto("/cadastro");

    // Plan buttons in planSelector use plain <button> with "alunos" text
    const planButton = page.locator("button").filter({ hasText: /alunos/ });
    await planButton.first().waitFor({ timeout: 15000 });
    await planButton.first().click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 2 should show plan info banner with price
    const planBanner = page.locator(".border-primary\\/30");
    await expect(planBanner).toBeVisible();
    await expect(planBanner.getByText(/R\$/)).toBeVisible();
  });

  test("password strength indicator changes with input", async ({ page }) => {
    await page.goto("/cadastro");

    const planButton = page.locator("button").filter({ hasText: /alunos/ });
    await planButton.first().waitFor({ timeout: 15000 });
    await planButton.first().click();
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

    const planButton = page.locator("button").filter({ hasText: /alunos/ });
    await planButton.first().waitFor({ timeout: 15000 });
    await planButton.first().click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Should be on step 2
    await expect(page.locator("#name")).toBeVisible();

    // Click back button
    await page.getByRole("button", { name: /Escolher outro plano/i }).click();

    // Should be back on step 1 (plan selection visible)
    await expect(page.getByText("Escolha seu plano")).toBeVisible();
  });
});
