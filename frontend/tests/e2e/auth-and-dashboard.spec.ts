import { expect, test, type Page } from "@playwright/test";

async function mockDashboardApis(page: Page) {
  await page.route("**/auth/refresh", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "unauthorized" }),
    });
  });

  await page.route("**/students*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: [],
        page: 1,
        size: 1,
        totalElements: 3,
        totalPages: 1,
      }),
    });
  });

  await page.route("**/bookings*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: [],
        page: 1,
        size: 100,
        totalElements: 0,
        totalPages: 0,
      }),
    });
  });

  await page.route("**/workout-plans*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: [],
        page: 1,
        size: 1,
        totalElements: 5,
        totalPages: 1,
      }),
    });
  });

  await page.route("**/personals/me/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "personal-id",
        userId: "user-id",
        name: "Joao Silva",
        email: "joao@coachos.test",
        slug: "joao-silva",
        bio: null,
        profilePhoto: null,
        themeColor: "#10b981",
        phoneNumber: null,
        lpTitle: null,
        lpSubtitle: null,
        lpHeroImage: null,
        lpAboutTitle: null,
        lpAboutText: null,
        lpImage1: null,
        lpImage2: null,
        lpImage3: null,
      }),
    });
  });

  await page.route("**/subscriptions/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        planId: "plan-basic",
        planName: "Basico",
        status: "trialing",
        trialEndsAt: "2099-01-10T00:00:00.000Z",
        subscriptionExpiresAt: null,
      }),
    });
  });
}

test("deve validar cadastro no client side", async ({ page }) => {
  await page.goto("/cadastro");

  await page.getByRole("button", { name: "Começar agora gratuitamente" }).click();

  await expect(page.getByText("Nome deve ter pelo menos 2 caracteres.")).toBeVisible();
  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  await expect(page.getByText("A senha deve ter no mínimo 8 caracteres.")).toBeVisible();
  await expect(page.getByText("Confirme sua senha.")).toBeVisible();
});

test("deve navegar do login para o painel com APIs mockadas", async ({ page }) => {
  await mockDashboardApis(page);

  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "header.eyJyb2xlIjoiUEVSU09OQUwiLCJwZXJzb25hbFNsdWciOiJqb2FvLXNpbHZhIn0.signature",
        role: "PERSONAL",
        personalSlug: "joao-silva",
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("E-mail").fill("joao@coachos.test");
  await page.getByLabel("Senha").fill("Password123!");
  await page.getByRole("button", { name: "Entrar na plataforma" }).click();

  await page.waitForURL("**/painel");
  await expect(page.getByRole("heading", { name: "Início" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Alunos ativos/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Planos de treino/i })).toBeVisible();
});

test("deve exibir navegação móvel no painel", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Este cenário cobre apenas mobile.");

  await mockDashboardApis(page);
  await page.goto("/painel");

  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeVisible();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.locator("aside").getByRole("button", { name: "Tema escuro", exact: true })).toBeVisible();
});
