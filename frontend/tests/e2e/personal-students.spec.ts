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

const MOCK_STUDENTS = [
  {
    id: "student-001",
    name: "Ana Pereira",
    email: "ana@test.com",
    isActive: true,
    servicePlanName: "Plano Básico",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "student-002",
    name: "Bruno Costa",
    email: "bruno@test.com",
    isActive: false,
    servicePlanName: null,
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-02-01T00:00:00.000Z",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

async function mockBaseApis(page: Page, students: object[] = []) {
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

  await page.route("**/students*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: students,
        page: 1,
        size: 10,
        totalElements: students.length,
        totalPages: 1,
      }),
    });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Gerenciamento de Alunos (/painel/alunos)", () => {
  test("renderiza o heading 'Alunos'", async ({ page }) => {
    await mockBaseApis(page);
    await page.goto("/painel/alunos");

    await expect(page.getByRole("heading", { name: "Alunos" })).toBeVisible();
  });

  test("exibe o campo de busca", async ({ page }) => {
    await mockBaseApis(page);
    await page.goto("/painel/alunos");

    await expect(
      page.getByPlaceholder("Buscar por nome ou e-mail..."),
    ).toBeVisible();
  });

  test("exibe os filtros rápidos", async ({ page }) => {
    await mockBaseApis(page);
    await page.goto("/painel/alunos");

    await expect(page.getByRole("button", { name: "Todos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ativos", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Inativos", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sem plano" })).toBeVisible();
  });

  test("exibe o botão 'Novo aluno'", async ({ page }) => {
    await mockBaseApis(page);
    await page.goto("/painel/alunos");

    await expect(page.getByRole("button", { name: "Novo aluno" })).toBeVisible();
  });

  test("exibe estado vazio quando não há alunos cadastrados", async ({ page }) => {
    await mockBaseApis(page, []);
    await page.goto("/painel/alunos");

    await expect(
      page.getByText("Você ainda não tem alunos cadastrados."),
    ).toBeVisible();
  });

  test("exibe os cabeçalhos da tabela", async ({ page }) => {
    await mockBaseApis(page);
    await page.goto("/painel/alunos");

    await expect(page.getByRole("columnheader", { name: "Nome" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "E-mail" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });

  test("exibe os nomes dos alunos quando existem alunos", async ({ page }) => {
    await mockBaseApis(page, MOCK_STUDENTS);
    await page.goto("/painel/alunos");

    await expect(page.getByText("Ana Pereira")).toBeVisible();
    await expect(page.getByText("Bruno Costa")).toBeVisible();
  });

  test("exibe os e-mails dos alunos na tabela", async ({ page }) => {
    await mockBaseApis(page, MOCK_STUDENTS);
    await page.goto("/painel/alunos");

    await expect(page.getByText("ana@test.com")).toBeVisible();
    await expect(page.getByText("bruno@test.com")).toBeVisible();
  });

  test("exibe badge 'Ativo' para alunos ativos", async ({ page }) => {
    await mockBaseApis(page, MOCK_STUDENTS);
    await page.goto("/painel/alunos");

    // The badge is inside a table cell to distinguish from the filter buttons (exact to avoid matching "Inativo")
    await expect(page.getByRole("cell", { name: "Ativo", exact: true })).toBeVisible();
  });

  test("exibe badge 'Inativo' para alunos inativos", async ({ page }) => {
    await mockBaseApis(page, MOCK_STUDENTS);
    await page.goto("/painel/alunos");

    await expect(page.getByText("Inativo")).toBeVisible();
  });

  test("navega para a página de detalhes do aluno ao clicar em 'Ver detalhes'", async ({
    page,
  }) => {
    await mockBaseApis(page, MOCK_STUDENTS);

    // Mock the student detail page APIs
    await page.route(`**/students/student-001`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STUDENTS[0]),
      });
    });
    await page.route("**/students/*/workout-plans", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.route("**/student-notes**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 }),
      });
    });
    await page.route("**/bookings**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 }),
      });
    });
    await page.route("**/workout-plans?**kind=template**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: 1, size: 100, totalElements: 0, totalPages: 0 }),
      });
    });

    await page.goto("/painel/alunos");

    // Hover to reveal the dropdown button, then click it
    const row = page.getByRole("row", { name: /Ana Pereira/ });
    await row.hover();
    await row.getByRole("button").click();

    await page.getByRole("menuitem", { name: "Ver detalhes" }).click();

    await page.waitForURL("**/painel/alunos/student-001**");
  });
});
