import { test, expect } from "@playwright/test";
import { loginAsDemoCoach } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/dashboard");
    // Wait for at least one stats card to be rendered
    await page.locator('[data-slot="stats-card"]').first().waitFor({ state: "visible" });
  });

  test("displays stats cards loaded from API", async ({ page }) => {
    const cards = page.locator('[data-slot="stats-card"]');
    await expect(cards).toHaveCount(4);

    // Wait for loading to finish — none of the values should be "—"
    await expect(
      page.locator('[data-slot="stats-card"]').filter({ hasText: "—" })
    ).toHaveCount(0);

    // All expected labels are present
    await expect(page.locator('[data-slot="stats-card"]').filter({ hasText: "Alunos ativos" })).toBeVisible();
    await expect(page.locator('[data-slot="stats-card"]').filter({ hasText: "Total de alunos" })).toBeVisible();
    await expect(page.locator('[data-slot="stats-card"]').filter({ hasText: "Templates de treino" })).toBeVisible();
    await expect(page.locator('[data-slot="stats-card"]').filter({ hasText: "Programas ativos" })).toBeVisible();
  });

  test("shows coach first name in greeting", async ({ page }) => {
    const heading = page.locator('[data-slot="page-header"] h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Olá,");
  });

  test.describe("Mobile", () => {
    // Only viewport can be set inside a describe — browserName/defaultBrowserType force a new worker
    test.use({ viewport: { width: 412, height: 915 } });

    test("stats cards are visible on mobile viewport", async ({ page }) => {
      await loginAsDemoCoach(page);
      await page.goto("/dashboard");
      await page.locator('[data-slot="stats-card"]').first().waitFor({ state: "visible" });

      const cards = page.locator('[data-slot="stats-card"]');
      await expect(cards).toHaveCount(4);

      for (let i = 0; i < 4; i++) {
        await expect(cards.nth(i)).toBeVisible();
      }
    });
  });
});
