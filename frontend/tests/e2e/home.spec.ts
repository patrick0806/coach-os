import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section", async ({ page }) => {
    // Badge — use exact match to avoid matching the paragraph too
    await expect(
      page.getByText("Plataforma completa para Personal Trainers", {
        exact: true,
      })
    ).toBeVisible();

    // CTA buttons — use first() since "Começar grátis" appears in navbar and hero
    await expect(
      page.getByRole("link", { name: "Começar 30 dias grátis" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ver planos/i })
    ).toBeVisible();
  });

  test("shows stats bar", async ({ page }) => {
    await expect(page.getByText(/500\+/)).toBeVisible();
    await expect(page.getByText(/10k\+/)).toBeVisible();
    await expect(page.getByText(/98%/)).toBeVisible();
  });

  test("renders feature blocks", async ({ page }) => {
    const featureBlocks = page.locator("section").filter({
      hasText: /treino|agenda|aluno/i,
    });
    expect(await featureBlocks.count()).toBeGreaterThan(0);
  });

  test("shows 'Como funciona' section with 3 steps", async ({ page }) => {
    await expect(page.getByText("Como funciona")).toBeVisible();

    // Use exact match to avoid footer "© 2026" matching "02"
    await expect(page.getByText("01", { exact: true })).toBeVisible();
    await expect(page.getByText("02", { exact: true })).toBeVisible();
    await expect(page.getByText("03", { exact: true })).toBeVisible();

    // Step titles
    await expect(page.getByText(/Cadastre/i).first()).toBeVisible();
    await expect(page.getByText(/Configure/i).first()).toBeVisible();
    await expect(page.getByText(/Gerencie/i).first()).toBeVisible();
  });

  test("loads pricing plans from API", async ({ page }) => {
    const plansSection = page.locator("#planos");
    await expect(plansSection).toBeVisible();

    // Plan cards use data-slot="plan-card"
    const planCards = plansSection.locator('[data-slot="plan-card"]');
    await expect(planCards.first()).toBeVisible({ timeout: 10000 });
    expect(await planCards.count()).toBeGreaterThanOrEqual(1);

    // Plans should show prices in BRL
    await expect(plansSection.getByText(/R\$/).first()).toBeVisible();
  });
});

test.describe("Navbar Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("hamburger menu opens sheet with links", async ({ page }) => {
    await page.goto("/");

    // Click hamburger menu button
    const menuButton = page.locator('[data-slot="navbar"] button').first();
    await menuButton.click();

    // Sheet should open with navigation links
    await expect(page.getByRole("link", { name: "Entrar" }).last()).toBeVisible();
  });
});
