import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section", async ({ page }) => {
    // Badge text
    await expect(
      page.getByText("Plataforma completa para Personal Trainers")
    ).toBeVisible();

    // CTA buttons
    await expect(
      page.getByRole("link", { name: /Começar.*grátis/i })
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
    // Feature blocks should have content (not just placeholder text)
    const featureBlocks = page.locator("[class*='feature'], section").filter({
      hasText: /treino|agenda|aluno/i,
    });
    expect(await featureBlocks.count()).toBeGreaterThan(0);
  });

  test("shows 'Como funciona' section with 3 steps", async ({ page }) => {
    await expect(page.getByText("Como funciona")).toBeVisible();

    // 3 step indicators
    await expect(page.getByText("01")).toBeVisible();
    await expect(page.getByText("02")).toBeVisible();
    await expect(page.getByText("03")).toBeVisible();

    // Step titles
    await expect(page.getByText(/Cadastre/i)).toBeVisible();
    await expect(page.getByText(/Configure/i)).toBeVisible();
    await expect(page.getByText(/Gerencie/i)).toBeVisible();
  });

  test("loads pricing plans from API", async ({ page }) => {
    const plansSection = page.locator("#planos");
    await expect(plansSection).toBeVisible();

    // Should have plan cards loaded from the API
    const planCards = page.locator('[data-slot="plan-card"]');
    await expect(planCards.first()).toBeVisible({ timeout: 10000 });
    expect(await planCards.count()).toBeGreaterThanOrEqual(1);

    // Plans should show prices in BRL
    await expect(plansSection.getByText(/R\$/)).toBeVisible();
  });
});

test.describe("Navbar Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("hamburger menu opens sheet with links", async ({ page }) => {
    await page.goto("/");

    // Desktop nav links should be hidden
    const desktopNav = page.getByRole("link", { name: "Funcionalidades" });
    await expect(desktopNav).toBeHidden();

    // Click hamburger menu button
    const menuButton = page.locator('[data-slot="navbar"] button').first();
    await menuButton.click();

    // Sheet should open with navigation links
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Começar grátis/i })
    ).toBeVisible();
  });
});
