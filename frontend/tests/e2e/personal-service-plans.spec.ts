import { expect, test, type Page } from "@playwright/test";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_PERSONAL = {
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
};

const ACTIVE_SUBSCRIPTION = {
  planId: "plan-basic",
  planName: "Basico",
  status: "active",
  trialEndsAt: null,
  subscriptionExpiresAt: null,
};

const MOCK_ACTIVE_PLAN = {
  id: "sp-001",
  name: "Acompanhamento Mensal",
  description: "Treino personalizado com acompanhamento semanal",
  // The service expects price as a string (it's stored as numeric in DB but returned as string)
  price: "299.00",
  sessionsPerWeek: 3,
  durationMinutes: 60,
  attendanceType: "presencial",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const MOCK_INACTIVE_PLAN = {
  id: "sp-002",
  name: "Plano Online Básico",
  description: null,
  price: "149.00",
  sessionsPerWeek: 2,
  durationMinutes: 45,
  attendanceType: "online",
  isActive: false,
  createdAt: "2024-02-01T00:00:00.000Z",
  updatedAt: "2024-02-01T00:00:00.000Z",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

async function mockServicePlanApis(page: Page, plans: object[] = []) {
  await page.route("**/auth/refresh", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "unauthorized" }),
    });
  });

  await page.route("**/personals/me/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_PERSONAL),
    });
  });

  await page.route("**/subscriptions/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(ACTIVE_SUBSCRIPTION),
    });
  });

  await page.route("**/service-plans*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(plans),
    });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Planos de Serviço (/painel/planos-servico)", () => {
  test("renderiza o heading 'Planos de Serviço'", async ({ page }) => {
    await mockServicePlanApis(page);
    await page.goto("/painel/planos-servico");

    await expect(page.getByRole("heading", { name: "Planos de Serviço" })).toBeVisible();
  });

  test("exibe o botão 'Novo plano'", async ({ page }) => {
    await mockServicePlanApis(page);
    await page.goto("/painel/planos-servico");

    await expect(page.getByRole("button", { name: "Novo plano" })).toBeVisible();
  });

  test("exibe estado vazio quando não há planos cadastrados", async ({ page }) => {
    await mockServicePlanApis(page, []);
    await page.goto("/painel/planos-servico");

    await expect(page.getByText("Você ainda não tem planos de serviço.")).toBeVisible();
  });

  test("exibe botão 'Criar primeiro plano' no estado vazio", async ({ page }) => {
    await mockServicePlanApis(page, []);
    await page.goto("/painel/planos-servico");

    await expect(page.getByRole("button", { name: "Criar primeiro plano" })).toBeVisible();
  });

  test("exibe o nome do plano quando existem planos ativos", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_ACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    await expect(page.getByText("Acompanhamento Mensal")).toBeVisible();
  });

  test("exibe o preço formatado do plano", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_ACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    // Price "299.00" formatted as R$ 299,00/mês using pt-BR locale
    await expect(page.getByText(/299/)).toBeVisible();
  });

  test("exibe a frequência semanal e duração do plano", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_ACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    await expect(page.getByText("3x por semana")).toBeVisible();
    await expect(page.getByText("60 min/sessão")).toBeVisible();
  });

  test("exibe a descrição do plano quando presente", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_ACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    await expect(
      page.getByText("Treino personalizado com acompanhamento semanal"),
    ).toBeVisible();
  });

  test("exibe seção 'Ativos' quando há planos ativos", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_ACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    await expect(page.getByText("Ativos")).toBeVisible();
  });

  test("exibe seção 'Inativos' quando há planos inativos", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_INACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    await expect(page.getByText("Inativos")).toBeVisible();
  });

  test("exibe badge 'Inativo' para planos desativados", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_INACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    // Use exact match to avoid strict mode violation with the "Inativos" section heading
    await expect(page.getByText("Inativo", { exact: true })).toBeVisible();
  });

  test("exibe botão 'Editar' para cada plano", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_ACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    await expect(page.getByRole("button", { name: "Editar" })).toBeVisible();
  });

  test("exibe botão 'Desativar' apenas para planos ativos", async ({ page }) => {
    await mockServicePlanApis(page, [MOCK_ACTIVE_PLAN, MOCK_INACTIVE_PLAN]);
    await page.goto("/painel/planos-servico");

    // Only active plan has the Desativar button
    await expect(page.getByRole("button", { name: "Desativar" })).toBeVisible();
  });

  test("abre o dialog de criar plano ao clicar em 'Novo plano'", async ({ page }) => {
    await mockServicePlanApis(page, []);
    await page.goto("/painel/planos-servico");

    await page.getByRole("button", { name: "Novo plano" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("abre o dialog de criar plano ao clicar em 'Criar primeiro plano'", async ({ page }) => {
    await mockServicePlanApis(page, []);
    await page.goto("/painel/planos-servico");

    await page.getByRole("button", { name: "Criar primeiro plano" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
