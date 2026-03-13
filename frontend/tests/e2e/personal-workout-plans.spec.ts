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

const TEMPLATE_PLAN = {
  id: "plan-template-001",
  personalId: "personal-id",
  name: "Treino Full Body A",
  description: "Treino completo para iniciantes",
  planKind: "template",
  sourceTemplateId: null,
  studentNames: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const STUDENT_PLAN = {
  id: "plan-student-001",
  personalId: "personal-id",
  name: "Treino João Costa",
  description: null,
  planKind: "student",
  sourceTemplateId: "plan-template-001",
  studentNames: ["João Costa"],
  createdAt: "2024-02-01T00:00:00.000Z",
  updatedAt: "2024-02-01T00:00:00.000Z",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

async function mockBaseApis(page: Page, plans: object[] = []) {
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

  await page.route("**/workout-plans*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: plans,
        page: 1,
        size: 10,
        totalElements: plans.length,
        totalPages: 1,
      }),
    });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Planos de Treino (/painel/treinos)", () => {
  test("renderiza o heading 'Modelos de Treino'", async ({ page }) => {
    await mockBaseApis(page);
    await page.goto("/painel/treinos");

    await expect(page.getByRole("heading", { name: "Modelos de Treino" })).toBeVisible();
  });

  test("exibe o botão 'Novo modelo'", async ({ page }) => {
    await mockBaseApis(page);
    await page.goto("/painel/treinos");

    await expect(page.getByRole("button", { name: "Novo modelo" })).toBeVisible();
  });

  test("exibe estado vazio quando não há planos cadastrados", async ({ page }) => {
    await mockBaseApis(page, []);
    await page.goto("/painel/treinos");

    await expect(
      page.getByText("Você ainda não tem modelos de treino."),
    ).toBeVisible();
  });

  test("exibe botão 'Criar primeiro modelo' no estado vazio", async ({ page }) => {
    await mockBaseApis(page, []);
    await page.goto("/painel/treinos");

    await expect(
      page.getByRole("button", { name: "Criar primeiro modelo" }),
    ).toBeVisible();
  });

  test("exibe os planos quando existem planos cadastrados", async ({ page }) => {
    await mockBaseApis(page, [TEMPLATE_PLAN]);
    await page.goto("/painel/treinos");

    await expect(page.getByText("Treino Full Body A")).toBeVisible();
  });

  test("exibe a descrição do plano quando presente", async ({ page }) => {
    await mockBaseApis(page, [TEMPLATE_PLAN]);
    await page.goto("/painel/treinos");

    await expect(page.getByText("Treino completo para iniciantes")).toBeVisible();
  });

  test("exibe os nomes dos alunos vinculados ao plano", async ({ page }) => {
    const planWithStudent = {
      ...TEMPLATE_PLAN,
      studentNames: ["João Costa", "Maria Silva"],
    };
    await mockBaseApis(page, [planWithStudent]);
    await page.goto("/painel/treinos");

    await expect(page.getByText(/João Costa/)).toBeVisible();
  });

  test("exibe o botão 'Aplicar' para cada plano listado", async ({ page }) => {
    await mockBaseApis(page, [TEMPLATE_PLAN]);
    await page.goto("/painel/treinos");

    await expect(page.getByRole("button", { name: "Aplicar" })).toBeVisible();
  });

  test("exibe múltiplos planos quando existem vários", async ({ page }) => {
    await mockBaseApis(page, [TEMPLATE_PLAN, { ...TEMPLATE_PLAN, id: "plan-002", name: "Treino HIIT" }]);
    await page.goto("/painel/treinos");

    await expect(page.getByText("Treino Full Body A")).toBeVisible();
    await expect(page.getByText("Treino HIIT")).toBeVisible();
  });

  test("abre o dialog de criar plano ao clicar em 'Novo modelo'", async ({ page }) => {
    await mockBaseApis(page, []);
    await page.goto("/painel/treinos");

    await page.getByRole("button", { name: "Novo modelo" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("abre o dialog de criar plano ao clicar em 'Criar primeiro modelo'", async ({ page }) => {
    await mockBaseApis(page, []);
    await page.goto("/painel/treinos");

    await page.getByRole("button", { name: "Criar primeiro modelo" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });

  // NOTE: The page only shows "template" kind plans — it uses kind=template filter.
  // The planKind "student" plans are not listed here; they appear on student detail pages.
  // The plans-list component does NOT show planKind badges (template/student). The task
  // specification mentions them but the actual PlansList component in /painel/treinos does
  // not render those badges. This is documented as a potential discrepancy.
});
