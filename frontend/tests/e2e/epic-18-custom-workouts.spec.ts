import { expect, test, type Page } from "@playwright/test";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const STUDENT_ID = "aaaa0001-0000-0000-0000-000000000001";
const TEMPLATE_PLAN_ID = "bbbb0001-0000-0000-0000-000000000001";
const STUDENT_PLAN_ID = "cccc0001-0000-0000-0000-000000000001";
const EXERCISE_ID = "dddd0001-0000-0000-0000-000000000001";
const WORKOUT_EXERCISE_ID = "eeee0001-0000-0000-0000-000000000001";

const mockTemplatePlan = {
  id: TEMPLATE_PLAN_ID,
  personalId: "personal-id",
  name: "Treino Base ABC",
  description: "Template padrão",
  planKind: "template",
  sourceTemplateId: null,
  studentNames: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockStudentPlan = {
  id: STUDENT_PLAN_ID,
  personalId: "personal-id",
  name: "Treino Manual João",
  description: null,
  planKind: "student",
  sourceTemplateId: null,
  studentNames: ["João Silva"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockStudentPlanWithExercise = {
  ...mockStudentPlan,
  exercises: [
    {
      id: WORKOUT_EXERCISE_ID,
      exerciseId: EXERCISE_ID,
      exerciseName: "Supino Reto",
      muscleGroup: "peito",
      exercisedbGifUrl: null,
      youtubeUrl: null,
      sets: 4,
      repetitions: 10,
      load: "60kg",
      restTime: "90s",
      executionTime: "3s",
      order: 0,
      notes: "Manter escápulas retraídas",
    },
  ],
};

const mockExercise = {
  id: EXERCISE_ID,
  name: "Supino Reto",
  description: null,
  muscleGroup: "peito",
  exercisedbGifUrl: null,
  youtubeUrl: null,
  personalId: null,
  isGlobal: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function mockStudentDetailApis(page: Page, plans: object[] = []) {
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

  await page.route("**/students/*/workout-plans", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(plans),
    });
  });

  await page.route(`**/students/${STUDENT_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: STUDENT_ID,
        name: "João Silva",
        email: "joao@test.com",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    });
  });

  await page.route("**/students?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 }),
    });
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

  await page.route("**/subscriptions/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        planId: "plan-basic",
        planName: "Basico",
        status: "active",
        trialEndsAt: null,
        expiresAt: null,
      }),
    });
  });
}

async function mockTemplateListApi(page: Page, templates: object[] = [mockTemplatePlan]) {
  await page.route("**/workout-plans?**kind=template**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: templates,
        page: 1,
        size: 100,
        totalElements: templates.length,
        totalPages: 1,
      }),
    });
  });
}

async function mockWorkoutPlanDetailApi(page: Page, plan: object = mockStudentPlanWithExercise) {
  await page.route(`**/workout-plans/${STUDENT_PLAN_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(plan),
    });
  });
}

async function mockExercisesApi(page: Page, exercises: object[] = [mockExercise]) {
  await page.route("**/exercises**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(exercises),
    });
  });
}

// ─── Testes: Aba Treinos do Aluno ─────────────────────────────────────────────

test.describe("Aba Treinos do Aluno — Epic 18", () => {
  test("exibe botões 'Atribuir de template' e 'Criar treino manual'", async ({ page }) => {
    await mockStudentDetailApis(page);

    await page.goto(`/painel/alunos/${STUDENT_ID}`);

    await expect(page.getByRole("button", { name: "Atribuir de template" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar treino manual" })).toBeVisible();
  });

  test("exibe lista vazia quando aluno não tem treinos", async ({ page }) => {
    await mockStudentDetailApis(page, []);

    await page.goto(`/painel/alunos/${STUDENT_ID}`);

    await expect(
      page.getByText("Nenhum plano de treino atribuído a este aluno."),
    ).toBeVisible();
  });

  test("exibe treinos atribuídos ao aluno", async ({ page }) => {
    await mockStudentDetailApis(page, [mockStudentPlan]);

    await page.goto(`/painel/alunos/${STUDENT_ID}`);

    await expect(page.getByText("Treino Manual João")).toBeVisible();
  });

  // ─── Atribuir de Template ────────────────────────────────────────────────────

  test("abre dialog de atribuição de template ao clicar no botão", async ({ page }) => {
    await mockStudentDetailApis(page);
    await mockTemplateListApi(page);

    await page.goto(`/painel/alunos/${STUDENT_ID}`);
    await page.getByRole("button", { name: "Atribuir de template" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Atribuir modelo de treino")).toBeVisible();
    await expect(page.getByText("Treino Base ABC")).toBeVisible();
  });

  test("exibe mensagem quando não há templates disponíveis", async ({ page }) => {
    await mockStudentDetailApis(page);
    await mockTemplateListApi(page, []);

    await page.goto(`/painel/alunos/${STUDENT_ID}`);
    await page.getByRole("button", { name: "Atribuir de template" }).click();

    await expect(page.getByText("Você não tem modelos disponíveis.")).toBeVisible();
  });

  test("atribui template ao aluno e fecha o dialog", async ({ page }) => {
    let assignCalled = false;

    await mockStudentDetailApis(page);
    await mockTemplateListApi(page);

    await page.route(`**/workout-plans/${TEMPLATE_PLAN_ID}/students`, async (route) => {
      assignCalled = true;
      await route.fulfill({ status: 204, body: "" });
    });

    await page.goto(`/painel/alunos/${STUDENT_ID}`);
    await page.getByRole("button", { name: "Atribuir de template" }).click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Treino Base ABC")).toBeVisible();

    // Clica no botão dentro da lista do dialog
    await dialog.locator("button").filter({ hasText: "Treino Base ABC" }).click();

    await expect(page.getByText("Plano atribuído ao aluno.")).toBeVisible();
    expect(assignCalled).toBe(true);
    await expect(dialog).not.toBeVisible();
  });

  // ─── Criar Treino Manual ─────────────────────────────────────────────────────

  test("abre dialog de criar treino manual ao clicar no botão", async ({ page }) => {
    await mockStudentDetailApis(page);

    await page.goto(`/painel/alunos/${STUDENT_ID}`);
    await page.getByRole("button", { name: "Criar treino manual" }).click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Criar treino manual")).toBeVisible();
    await expect(dialog.getByLabel("Nome do treino")).toBeVisible();
    await expect(dialog.getByLabel("Descrição (opcional)")).toBeVisible();
  });

  test("valida campo nome obrigatório no dialog de criar treino manual", async ({ page }) => {
    await mockStudentDetailApis(page);

    await page.goto(`/painel/alunos/${STUDENT_ID}`);
    await page.getByRole("button", { name: "Criar treino manual" }).click();

    await page.getByRole("button", { name: "Criar e abrir" }).click();

    await expect(page.getByText("Nome é obrigatório")).toBeVisible();
  });

  test("cria treino manual e navega para o editor do plano", async ({ page }) => {
    let createCalled = false;
    let requestBody: Record<string, unknown> = {};

    await mockStudentDetailApis(page);
    await mockWorkoutPlanDetailApi(page);

    await page.route("**/workout-plans/student", async (route) => {
      createCalled = true;
      requestBody = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(mockStudentPlan),
      });
    });

    await page.goto(`/painel/alunos/${STUDENT_ID}`);
    await page.getByRole("button", { name: "Criar treino manual" }).click();

    await page.getByLabel("Nome do treino").fill("Treino Manual João");
    await page.getByLabel("Descrição (opcional)").fill("Foco em hipertrofia");
    await page.getByRole("button", { name: "Criar e abrir" }).click();

    await expect(page.getByText("Treino criado.")).toBeVisible();

    expect(createCalled).toBe(true);
    expect(requestBody.name).toBe("Treino Manual João");
    expect(requestBody.description).toBe("Foco em hipertrofia");
    expect(requestBody.studentId).toBe(STUDENT_ID);

    await page.waitForURL(`**/painel/treinos/${STUDENT_PLAN_ID}**`);
  });

  test("fecha dialog de criar treino manual ao clicar em Cancelar", async ({ page }) => {
    await mockStudentDetailApis(page);

    await page.goto(`/painel/alunos/${STUDENT_ID}`);
    await page.getByRole("button", { name: "Criar treino manual" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

// ─── Testes: Builder de Treinos — Campos Descanso e Execução ──────────────────

test.describe("Builder de Treinos — Campos Descanso e Execução", () => {
  test("exibe badge 'Treino personalizado' para planos do tipo student", async ({ page }) => {
    await mockWorkoutPlanDetailApi(page);

    await page.goto(`/painel/treinos/${STUDENT_PLAN_ID}`);

    await expect(page.getByText("Treino personalizado")).toBeVisible();
  });

  test("não exibe badge 'Treino personalizado' para planos do tipo template", async ({ page }) => {
    const templatePlanDetail = {
      ...mockTemplatePlan,
      exercises: [],
    };

    await page.route(`**/workout-plans/${TEMPLATE_PLAN_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(templatePlanDetail),
      });
    });

    await page.goto(`/painel/treinos/${TEMPLATE_PLAN_ID}`);

    await expect(page.getByText("Treino personalizado")).not.toBeVisible();
  });

  test("exibe campos Descanso e Tempo de execução no dialog de adicionar exercício", async ({
    page,
  }) => {
    await mockWorkoutPlanDetailApi(page, { ...mockStudentPlanWithExercise, exercises: [] });
    await mockExercisesApi(page);

    await page.goto(`/painel/treinos/${STUDENT_PLAN_ID}`);
    // Clica no botão "Adicionar" do header do card (exact match para evitar "Adicionar exercício")
    await page.getByRole("button", { name: "Adicionar", exact: true }).click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Supino Reto")).toBeVisible();
    await dialog.getByText("Supino Reto").click();

    await expect(dialog.getByLabel("Descanso (opcional)")).toBeVisible();
    await expect(dialog.getByLabel("Tempo de execução (opcional)")).toBeVisible();
  });

  test("envia restTime e executionTime ao adicionar exercício", async ({ page }) => {
    let requestBody: Record<string, unknown> = {};

    await mockWorkoutPlanDetailApi(page, { ...mockStudentPlanWithExercise, exercises: [] });
    await mockExercisesApi(page);

    await page.route(`**/workout-plans/${STUDENT_PLAN_ID}/exercises`, async (route) => {
      if (route.request().method() === "POST") {
        requestBody = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockStudentPlanWithExercise),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`/painel/treinos/${STUDENT_PLAN_ID}`);
    await page.getByRole("button", { name: "Adicionar", exact: true }).click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await dialog.getByText("Supino Reto").click();

    await dialog.getByLabel("Séries").fill("4");
    await dialog.getByLabel("Repetições").fill("10");
    await dialog.getByLabel("Descanso (opcional)").fill("90s");
    await dialog.getByLabel("Tempo de execução (opcional)").fill("3s");

    await dialog.getByRole("button", { name: "Adicionar" }).click();

    await expect(page.getByText("Exercício adicionado.")).toBeVisible();
    expect(requestBody.restTime).toBe("90s");
    expect(requestBody.executionTime).toBe("3s");
  });

  test("campos Descanso e Execução são opcionais — omitidos quando vazios", async ({ page }) => {
    let requestBody: Record<string, unknown> = {};

    await mockWorkoutPlanDetailApi(page, { ...mockStudentPlanWithExercise, exercises: [] });
    await mockExercisesApi(page);

    await page.route(`**/workout-plans/${STUDENT_PLAN_ID}/exercises`, async (route) => {
      if (route.request().method() === "POST") {
        requestBody = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockStudentPlanWithExercise),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`/painel/treinos/${STUDENT_PLAN_ID}`);
    await page.getByRole("button", { name: "Adicionar", exact: true }).click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await dialog.getByText("Supino Reto").click();

    // Não preenche restTime nem executionTime
    await dialog.getByRole("button", { name: "Adicionar" }).click();

    await expect(page.getByText("Exercício adicionado.")).toBeVisible();
    expect(requestBody.restTime).toBeUndefined();
    expect(requestBody.executionTime).toBeUndefined();
  });
});

// ─── Testes: ExerciseRow — exibição dos novos campos ─────────────────────────

test.describe("ExerciseRow — Exibição de Descanso e Execução", () => {
  test("exibe restTime e executionTime quando presentes no exercício", async ({ page }) => {
    await mockWorkoutPlanDetailApi(page);

    await page.goto(`/painel/treinos/${STUDENT_PLAN_ID}`);

    await expect(page.getByText("Descanso: 90s")).toBeVisible();
    await expect(page.getByText(/Execução: 3s/)).toBeVisible();
  });

  test("não exibe linha de descanso/execução quando campos são nulos", async ({ page }) => {
    const planWithoutTimes = {
      ...mockStudentPlanWithExercise,
      exercises: [
        {
          ...mockStudentPlanWithExercise.exercises[0],
          restTime: null,
          executionTime: null,
        },
      ],
    };

    await mockWorkoutPlanDetailApi(page, planWithoutTimes);

    await page.goto(`/painel/treinos/${STUDENT_PLAN_ID}`);

    await expect(page.getByText(/Descanso:/)).not.toBeVisible();
    await expect(page.getByText(/Execução:/)).not.toBeVisible();
  });

  test("exibe apenas restTime quando executionTime é nulo", async ({ page }) => {
    const planWithOnlyRest = {
      ...mockStudentPlanWithExercise,
      exercises: [
        {
          ...mockStudentPlanWithExercise.exercises[0],
          restTime: "60s",
          executionTime: null,
        },
      ],
    };

    await mockWorkoutPlanDetailApi(page, planWithOnlyRest);

    await page.goto(`/painel/treinos/${STUDENT_PLAN_ID}`);

    await expect(page.getByText("Descanso: 60s")).toBeVisible();
    await expect(page.getByText(/Execução:/)).not.toBeVisible();
  });

  test("exibe apenas executionTime quando restTime é nulo", async ({ page }) => {
    const planWithOnlyExec = {
      ...mockStudentPlanWithExercise,
      exercises: [
        {
          ...mockStudentPlanWithExercise.exercises[0],
          restTime: null,
          executionTime: "4s",
        },
      ],
    };

    await mockWorkoutPlanDetailApi(page, planWithOnlyExec);

    await page.goto(`/painel/treinos/${STUDENT_PLAN_ID}`);

    await expect(page.getByText("Execução: 4s")).toBeVisible();
    await expect(page.getByText(/Descanso:/)).not.toBeVisible();
  });
});
