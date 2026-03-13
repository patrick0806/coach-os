import { expect, test, type Page } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVE_SUBSCRIPTION = {
  planId: "plan-basic",
  planName: "Basico",
  status: "active",
  trialEndsAt: null,
  subscriptionExpiresAt: null,
};

const TRIALING_SOON_SUBSCRIPTION = {
  planId: "plan-basic",
  planName: "Basico",
  status: "trialing",
  // 3 days from now so the trial warning banner is shown
  trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  subscriptionExpiresAt: null,
};

const TRIALING_FAR_SUBSCRIPTION = {
  planId: "plan-basic",
  planName: "Basico",
  status: "trialing",
  // 30 days from now — banner should NOT appear
  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  subscriptionExpiresAt: null,
};

const MOCK_PERSONAL = {
  id: "personal-id",
  userId: "user-id",
  name: "Joao Silva",
  email: "joao@coachos.test",
  slug: "joao-silva",
  bio: "Bio do personal",
  profilePhoto: "https://example.com/photo.jpg",
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

async function mockDashboardApis(
  page: Page,
  options: {
    subscription?: object;
    bookings?: object;
  } = {},
) {
  const subscription = options.subscription ?? ACTIVE_SUBSCRIPTION;
  const bookings = options.bookings ?? {
    content: [],
    page: 1,
    size: 100,
    totalElements: 0,
    totalPages: 0,
  };

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
      body: JSON.stringify(subscription),
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

  await page.route("**/bookings*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(bookings),
    });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Dashboard pessoal (/painel)", () => {
  test("renderiza o heading e os KPI cards principais", async ({ page }) => {
    await mockDashboardApis(page);
    await page.goto("/painel");

    await expect(page.getByRole("heading", { name: "Início" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Alunos ativos/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Planos de treino/i })).toBeVisible();
    // "Sessões hoje" uses a link too
    await expect(page.getByRole("link", { name: /Sessões hoje/i })).toBeVisible();
  });

  test("exibe os valores corretos nos KPI cards com dados mockados", async ({ page }) => {
    await mockDashboardApis(page);
    await page.goto("/painel");

    // Students count comes from totalElements: 3
    await expect(page.getByText("3")).toBeVisible();
    // Plans count comes from totalElements: 5
    await expect(page.getByText("5")).toBeVisible();
  });

  test("exibe mensagem de estado vazio para próximas sessões quando não há agendamentos", async ({
    page,
  }) => {
    await mockDashboardApis(page);
    await page.goto("/painel");

    await expect(
      page.getByText("Você ainda não possui sessões agendadas para os próximos dias."),
    ).toBeVisible();
  });

  test("exibe o card 'Próximas sessões'", async ({ page }) => {
    await mockDashboardApis(page);
    await page.goto("/painel");

    await expect(page.getByText("Próximas sessões")).toBeVisible();
  });

  test("exibe o banner de aviso de trial quando restam <= 7 dias", async ({ page }) => {
    await mockDashboardApis(page, { subscription: TRIALING_SOON_SUBSCRIPTION });
    await page.goto("/painel");

    await expect(page.getByText(/Seu trial termina em/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver assinatura" })).toBeVisible();
  });

  test("NÃO exibe o banner de trial quando o status é 'active'", async ({ page }) => {
    await mockDashboardApis(page, { subscription: ACTIVE_SUBSCRIPTION });
    await page.goto("/painel");

    await expect(page.getByText(/Seu trial termina em/)).not.toBeVisible();
  });

  test("NÃO exibe o banner de trial quando o trial termina em mais de 7 dias", async ({ page }) => {
    await mockDashboardApis(page, { subscription: TRIALING_FAR_SUBSCRIPTION });
    await page.goto("/painel");

    await expect(page.getByText(/Seu trial termina em/)).not.toBeVisible();
  });

  test("exibe cards de sessões quando existem agendamentos futuros", async ({ page }) => {
    const bookingWithData = {
      content: [
        {
          id: "booking-1",
          studentName: "Carlos Almeida",
          servicePlanName: "Plano Básico",
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          startTime: "09:00",
          endTime: "10:00",
          status: "scheduled",
          isRecurring: false,
        },
      ],
      page: 1,
      size: 5,
      totalElements: 1,
      totalPages: 1,
    };

    await mockDashboardApis(page, { bookings: bookingWithData });
    await page.goto("/painel");

    await expect(page.getByText("Carlos Almeida").first()).toBeVisible();
    await expect(page.getByText("Plano Básico").first()).toBeVisible();
  });

  test("exibe dica de completar perfil quando bio e foto estão ausentes", async ({ page }) => {
    const personalWithoutProfile = {
      ...MOCK_PERSONAL,
      bio: null,
      profilePhoto: null,
    };

    await page.route("**/auth/refresh", async (route) => {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "unauthorized" }) });
    });
    await page.route("**/personals/me/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(personalWithoutProfile),
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
        body: JSON.stringify({ content: [], page: 1, size: 1, totalElements: 0, totalPages: 1 }),
      });
    });
    await page.route("**/workout-plans*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: 1, size: 1, totalElements: 0, totalPages: 1 }),
      });
    });
    await page.route("**/bookings*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: 1, size: 100, totalElements: 0, totalPages: 0 }),
      });
    });

    await page.goto("/painel");

    await expect(page.getByText("Complete seu perfil profissional")).toBeVisible();
    await expect(page.getByRole("link", { name: "Configurar perfil" })).toBeVisible();
  });
});
