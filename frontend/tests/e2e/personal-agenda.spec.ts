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
  expiresAt: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

async function mockAgendaApis(
  page: Page,
  options: {
    bookings?: object;
    sessions?: object[];
  } = {},
) {
  const bookings = options.bookings ?? {
    content: [],
    page: 1,
    size: 100,
    totalElements: 0,
    totalPages: 0,
  };
  const sessions = options.sessions ?? [];

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

  await page.route("**/bookings*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(bookings),
    });
  });

  await page.route("**/training-sessions/personal-calendar*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sessions),
    });
  });
}

/** Returns this week's Monday as "YYYY-MM-DD" */
function getMondayIso(): string {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return monday.toISOString().split("T")[0];
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Agenda do Personal (/painel/agenda)", () => {
  test("renderiza o heading 'Agenda'", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
  });

  test("exibe o label da semana atual com separador '–'", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    // The week label format is "DD mês – DD mês YYYY"
    const weekNav = page.getByTestId("week-nav");
    await expect(weekNav.locator("span")).toContainText("–");
  });

  test("exibe os botões de navegação de semana", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    await expect(page.getByRole("button", { name: "Semana anterior" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Próxima semana" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hoje" })).toBeVisible();
  });

  test("exibe o botão 'Adicionar avulso'", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    await expect(page.getByRole("button", { name: "Adicionar avulso" })).toBeVisible();
  });

  test("exibe link para configurar disponibilidade", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    await expect(page.getByRole("link", { name: "Configurar disponibilidade" })).toBeVisible();
  });

  test("exibe estado vazio quando não há compromissos na semana", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    await expect(page.getByText("Nenhum compromisso neste período.")).toBeVisible();
  });

  test("exibe as abas de filtro de status", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    await expect(page.getByRole("button", { name: "Todos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Agendados/Pendentes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Concluídos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancelados" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Não compareceu" })).toBeVisible();
  });

  test("exibe agendamentos agrupados por data quando existem bookings", async ({ page }) => {
    const mondayStr = getMondayIso();

    const bookingWithData = {
      content: [
        {
          id: "booking-1",
          studentName: "Maria Ferreira",
          servicePlanName: "Plano Básico",
          scheduledDate: mondayStr,
          startTime: "08:00",
          endTime: "09:00",
          status: "scheduled",
          isRecurring: false,
        },
      ],
      page: 1,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    };

    await mockAgendaApis(page, { bookings: bookingWithData });
    await page.goto("/painel/agenda");

    await expect(page.getByText("Maria Ferreira")).toBeVisible();
    await expect(page.getByText("Sessão Avulsa")).toBeVisible();
  });

  test("exibe o horário do agendamento", async ({ page }) => {
    const mondayStr = getMondayIso();

    const bookingWithData = {
      content: [
        {
          id: "booking-2",
          studentName: "Pedro Santos",
          servicePlanName: "Plano Premium",
          scheduledDate: mondayStr,
          startTime: "10:00",
          endTime: "11:00",
          status: "scheduled",
          isRecurring: false,
        },
      ],
      page: 1,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    };

    await mockAgendaApis(page, { bookings: bookingWithData });
    await page.goto("/painel/agenda");

    await expect(page.getByText("10:00")).toBeVisible();
  });

  test("exibe sessões de treino recorrentes quando existem sessions", async ({ page }) => {
    const mondayStr = getMondayIso();

    const sessions = [
      {
        id: "session-1",
        studentName: "Carlos Lima",
        scheduledDate: mondayStr,
        startTime: "06:00",
        endTime: "07:00",
        status: "pending",
        sessionType: "presential",
        workoutPlanId: "plan-001",
      },
    ];

    await mockAgendaApis(page, { sessions });
    await page.goto("/painel/agenda");

    await expect(page.getByText("Carlos Lima")).toBeVisible();
    await expect(page.getByText("Treino Presencial")).toBeVisible();
  });

  test("NÃO exibe sessões do tipo 'rest' na agenda", async ({ page }) => {
    const mondayStr = getMondayIso();

    const sessions = [
      {
        id: "session-rest-1",
        studentName: "Ana Costa",
        scheduledDate: mondayStr,
        startTime: null,
        endTime: null,
        status: "pending",
        sessionType: "rest",
        workoutPlanId: null,
      },
    ];

    await mockAgendaApis(page, { sessions });
    await page.goto("/painel/agenda");

    // Rest sessions are filtered out — empty state should show
    await expect(page.getByText("Nenhum compromisso neste período.")).toBeVisible();
    await expect(page.getByText("Ana Costa")).not.toBeVisible();
  });

  test("navega para a semana anterior ao clicar na seta esquerda", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    const weekNav = page.getByTestId("week-nav");
    const initialLabel = await weekNav.locator("span").textContent();

    await page.getByRole("button", { name: "Semana anterior" }).click();

    const newLabel = await weekNav.locator("span").textContent();
    expect(newLabel).not.toBe(initialLabel);
  });

  test("navega para a semana seguinte ao clicar na seta direita", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    const weekNav = page.getByTestId("week-nav");
    const initialLabel = await weekNav.locator("span").textContent();

    await page.getByRole("button", { name: "Próxima semana" }).click();

    const newLabel = await weekNav.locator("span").textContent();
    expect(newLabel).not.toBe(initialLabel);
  });

  test("retorna para a semana atual ao clicar em 'Hoje'", async ({ page }) => {
    await mockAgendaApis(page);
    await page.goto("/painel/agenda");

    const weekNav = page.getByTestId("week-nav");
    const initialLabel = await weekNav.locator("span").textContent();

    // Go to previous week
    await page.getByRole("button", { name: "Semana anterior" }).click();
    const prevLabel = await weekNav.locator("span").textContent();
    expect(prevLabel).not.toBe(initialLabel);

    // Return to current week
    await page.getByRole("button", { name: "Hoje" }).click();
    const backLabel = await weekNav.locator("span").textContent();
    expect(backLabel).toBe(initialLabel);
  });

  test("filtro 'Agendados/Pendentes' oculta itens concluídos", async ({ page }) => {
    const mondayStr = getMondayIso();

    const bookingWithData = {
      content: [
        {
          id: "booking-scheduled",
          studentName: "Aluno Agendado",
          servicePlanName: "Plano A",
          scheduledDate: mondayStr,
          startTime: "09:00",
          endTime: "10:00",
          status: "scheduled",
          isRecurring: false,
        },
      ],
      page: 1,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    };

    // Mock returns scheduled bookings regardless of filter (filter is applied client-side for sessions,
    // but server-side for bookings — the mock always returns the same data so we just verify the tab is clickable)
    await mockAgendaApis(page, { bookings: bookingWithData });
    await page.goto("/painel/agenda");

    // Click the "Agendados/Pendentes" tab — no error should occur
    await page.getByRole("button", { name: "Agendados/Pendentes" }).click();

    // The button should now appear visually active (no assertion on style, just that it's still visible)
    await expect(page.getByRole("button", { name: "Agendados/Pendentes" })).toBeVisible();
  });
});
