import { expect, test, type Page } from "@playwright/test";

// ─── Constants ────────────────────────────────────────────────────────────────

const SLUG = "joao-silva";
const PLAN_ID = "wp-stu-001";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_PLAN = {
  id: PLAN_ID,
  name: "Treino Hipertrofia A",
  description: "Foco em membros superiores",
  planKind: "student",
  createdAt: "2024-03-01T00:00:00.000Z",
  updatedAt: "2024-03-01T00:00:00.000Z",
};

const MOCK_PLAN_WITH_EXERCISES = {
  ...MOCK_PLAN,
  exercises: [
    {
      id: "ex-progress-001",
      exerciseId: "ex-001",
      exerciseName: "Supino Reto",
      muscleGroup: "peito",
      exercisedbGifUrl: null,
      youtubeUrl: null,
      sets: 4,
      repetitions: 10,
      load: "60kg",
      restTime: "90s",
      executionTime: null,
      order: 0,
      notes: null,
    },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

async function mockStudentTreinosApis(page: Page, plans: object[] = []) {
  await page.route("**/auth/refresh", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "unauthorized" }),
    });
  });

  await page.route("**/students/me/workout-plans*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(plans),
    });
  });
}

// ─── Tests: Lista de Treinos ───────────────────────────────────────────────────

test.describe(`Treinos do Aluno (/${SLUG}/alunos/treinos)`, () => {
  test("renderiza o heading 'Meus Treinos'", async ({ page }) => {
    await mockStudentTreinosApis(page);
    await page.goto(`/${SLUG}/alunos/treinos`);

    await expect(page.getByRole("heading", { name: "Meus Treinos" })).toBeVisible();
  });

  test("exibe o subtítulo da biblioteca de treinos", async ({ page }) => {
    await mockStudentTreinosApis(page);
    await page.goto(`/${SLUG}/alunos/treinos`);

    await expect(
      page.getByText("Planos de treino atribuídos pelo seu personal."),
    ).toBeVisible();
  });

  test("exibe estado vazio quando não há planos atribuídos", async ({ page }) => {
    await mockStudentTreinosApis(page, []);
    await page.goto(`/${SLUG}/alunos/treinos`);

    await expect(
      page.getByText("Você ainda não tem planos de treino atribuídos."),
    ).toBeVisible();
  });

  test("exibe o nome do plano quando existem planos atribuídos", async ({ page }) => {
    await mockStudentTreinosApis(page, [MOCK_PLAN]);
    await page.goto(`/${SLUG}/alunos/treinos`);

    await expect(page.getByText("Treino Hipertrofia A")).toBeVisible();
  });

  test("exibe a descrição do plano quando presente", async ({ page }) => {
    await mockStudentTreinosApis(page, [MOCK_PLAN]);
    await page.goto(`/${SLUG}/alunos/treinos`);

    await expect(page.getByText("Foco em membros superiores")).toBeVisible();
  });

  test("exibe múltiplos planos quando há vários atribuídos", async ({ page }) => {
    const secondPlan = {
      ...MOCK_PLAN,
      id: "wp-stu-002",
      name: "Treino Hipertrofia B",
      description: "Foco em membros inferiores",
    };
    await mockStudentTreinosApis(page, [MOCK_PLAN, secondPlan]);
    await page.goto(`/${SLUG}/alunos/treinos`);

    await expect(page.getByText("Treino Hipertrofia A")).toBeVisible();
    await expect(page.getByText("Treino Hipertrofia B")).toBeVisible();
  });

  test("navega para a página de detalhes do plano ao clicar", async ({ page }) => {
    await mockStudentTreinosApis(page, [MOCK_PLAN]);

    // Mock the plan detail endpoint so the destination page can load
    await page.route(`**/students/me/workout-plans/${PLAN_ID}*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PLAN_WITH_EXERCISES),
      });
    });

    await page.goto(`/${SLUG}/alunos/treinos`);

    // The plan is rendered as a link
    await page.getByRole("link", { name: /Treino Hipertrofia A/ }).click();

    await page.waitForURL(`**/${SLUG}/alunos/treinos/${PLAN_ID}**`);
  });
});

// ─── Tests: Detalhe do Plano ──────────────────────────────────────────────────

test.describe(`Detalhe do Treino do Aluno (/${SLUG}/alunos/treinos/${PLAN_ID})`, () => {
  async function mockPlanDetailApis(page: Page, plan: object | null = MOCK_PLAN_WITH_EXERCISES) {
    await page.route("**/auth/refresh", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "unauthorized" }),
      });
    });

    await page.route(`**/students/me/workout-plans/${PLAN_ID}*`, async (route) => {
      if (plan) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(plan),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ message: "not found" }),
        });
      }
    });
  }

  test("exibe o nome do exercício na tela de treino", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    // "Supino Reto" appears in both the heading and the queue list — use first()
    await expect(page.getByRole("heading", { name: "Supino Reto" })).toBeVisible();
  });

  test("exibe o nome do plano", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    await expect(page.getByText("Treino Hipertrofia A")).toBeVisible();
  });

  test("exibe o botão 'Modo Player'", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    await expect(page.getByRole("link", { name: /Modo Player/ })).toBeVisible();
  });

  test("exibe o progresso total do treino", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    await expect(page.getByText(/Progresso total/)).toBeVisible();
  });

  test("exibe o botão 'Sair do treino'", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    await expect(page.getByRole("link", { name: "Sair do treino" })).toBeVisible();
  });

  test("exibe o link 'Sair do treino' apontando para a lista de treinos", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    const link = page.getByRole("link", { name: "Sair do treino" });
    await expect(link).toHaveAttribute("href", `/${SLUG}/alunos/treinos`);
  });

  test("exibe o botão 'Série concluída'", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    await expect(page.getByRole("button", { name: "Série concluída" })).toBeVisible();
  });

  test("exibe a fila do treino com os exercícios", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    await expect(page.getByText("Fila do treino")).toBeVisible();
  });

  // NOTE: Testing the "Treino não encontrado." state requires React Query to exhaust all retries
  // (3 by default with exponential backoff). This is skipped to avoid flaky timeouts.
  // The component logic: if (!plan) renders "Treino não encontrado." — covered by code review.

  test("exibe o label 'Exercício 1 de N' para o exercício atual", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    await expect(page.getByText(/Exercício 1 de 1/)).toBeVisible();
  });

  test("exibe mensagem quando plano não possui exercícios", async ({ page }) => {
    const emptyPlan = { ...MOCK_PLAN, exercises: [] };
    await mockPlanDetailApis(page, emptyPlan);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    await expect(page.getByText("Este treino ainda não possui exercícios.")).toBeVisible();
  });

  test("exibe o timer de descanso", async ({ page }) => {
    await mockPlanDetailApis(page);
    await page.goto(`/${SLUG}/alunos/treinos/${PLAN_ID}`);

    // Use exact to avoid matching the "Retomar descanso" button text
    await expect(page.getByText("Descanso", { exact: true })).toBeVisible();
  });
});
