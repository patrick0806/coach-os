import { expect, test, type Page } from "@playwright/test";

// ─── Constants ────────────────────────────────────────────────────────────────

const SLUG = "joao-silva";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_BOOKING = {
  id: "booking-stu-001",
  studentName: "Aluno Teste",
  servicePlanName: "Plano Básico",
  scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "10:00",
  status: "scheduled",
  isRecurring: false,
};

const MOCK_SERVICE_PLANS = [
  {
    id: "sp-pub-001",
    name: "Acompanhamento Mensal",
    description: null,
    price: 29900,
    sessionsPerWeek: 3,
    durationMinutes: 60,
    attendanceType: "presencial",
    isActive: true,
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

async function mockStudentAgendaApis(
  page: Page,
  options: {
    bookings?: object[];
    slots?: object[];
  } = {},
) {
  const bookings = options.bookings ?? [];
  const slots = options.slots ?? [];

  await page.route("**/auth/refresh", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "unauthorized" }),
    });
  });

  await page.route("**/bookings/me*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(bookings),
    });
  });

  await page.route(`**/personals/${SLUG}/available-slots*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(slots),
    });
  });

  // Fallback for available-slots without slug in path
  await page.route("**/available-slots*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(slots),
    });
  });

  await page.route(`**/service-plans/public/${SLUG}*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SERVICE_PLANS),
    });
  });

  // Fallback for all service-plans public routes
  await page.route("**/service-plans/public**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SERVICE_PLANS),
    });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe(`Agenda do Aluno (/${SLUG}/alunos/agenda)`, () => {
  test("renderiza o heading 'Agenda'", async ({ page }) => {
    await mockStudentAgendaApis(page);
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
  });

  test("exibe o subtítulo de agendamento", async ({ page }) => {
    await mockStudentAgendaApis(page);
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(
      page.getByText("Agende sessões com seu personal trainer."),
    ).toBeVisible();
  });

  test("exibe o formulário de agendamento com campo de data", async ({ page }) => {
    await mockStudentAgendaApis(page);
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(page.getByLabel("Data")).toBeVisible();
  });

  test("exibe a seção 'Agendar sessão'", async ({ page }) => {
    await mockStudentAgendaApis(page);
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(page.getByText("Agendar sessão")).toBeVisible();
  });

  test("exibe a seção de horários disponíveis", async ({ page }) => {
    await mockStudentAgendaApis(page);
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(page.getByText("Horários disponíveis")).toBeVisible();
  });

  test("exibe mensagem quando não há horários disponíveis na data", async ({ page }) => {
    await mockStudentAgendaApis(page, { slots: [] });
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(
      page.getByText("Nenhum horário disponível nesta data."),
    ).toBeVisible();
  });

  test("NÃO exibe o card 'Próximas sessões' quando não há bookings agendados", async ({
    page,
  }) => {
    await mockStudentAgendaApis(page, { bookings: [] });
    await page.goto(`/${SLUG}/alunos/agenda`);

    // The UpcomingBookings component returns null when no scheduled bookings
    await expect(page.getByText("Próximas sessões")).not.toBeVisible();
  });

  test("exibe o card 'Próximas sessões' quando há bookings agendados", async ({ page }) => {
    await mockStudentAgendaApis(page, { bookings: [MOCK_BOOKING] });
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(page.getByText("Próximas sessões")).toBeVisible();
    await expect(page.getByText("Plano Básico")).toBeVisible();
  });

  test("exibe horário do agendamento próximo", async ({ page }) => {
    await mockStudentAgendaApis(page, { bookings: [MOCK_BOOKING] });
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(page.getByText("09:00", { exact: true }).first()).toBeVisible();
  });

  test("exibe slots de horário disponíveis como botões", async ({ page }) => {
    const availableSlots = [
      { startTime: "08:00", endTime: "09:00" },
      { startTime: "10:00", endTime: "11:00" },
    ];
    await mockStudentAgendaApis(page, { slots: availableSlots });
    await page.goto(`/${SLUG}/alunos/agenda`);

    await expect(page.getByRole("button", { name: /08:00/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /10:00/ })).toBeVisible();
  });
});
