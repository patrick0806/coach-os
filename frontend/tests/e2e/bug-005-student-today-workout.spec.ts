import { expect, test, type Page } from "@playwright/test";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SLUG = "joao-silva";
const WORKOUT_PLAN_ID = "wp-aaaa-0001";
const SESSION_ID = "sess-bbbb-0001";

const PAINEL_URL = `/${SLUG}/alunos/painel`;

const makeSession = (overrides: Record<string, unknown> = {}) => ({
  id: SESSION_ID,
  personalId: "personal-1",
  studentId: "student-1",
  scheduleRuleId: "rule-1",
  workoutPlanId: WORKOUT_PLAN_ID,
  workoutSessionId: null,
  scheduledDate: new Date().toISOString().split("T")[0],
  startTime: "07:00",
  endTime: "08:00",
  status: "pending",
  sessionType: "online",
  cancelledAt: null,
  cancellationReason: null,
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function mockStudentPainelApis(page: Page) {
  await page.route("**/auth/refresh", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "unauthorized" }) }),
  );

  await page.route("**/bookings*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) }),
  );

  await page.route("**/students/me/stats", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ currentStreak: 3, lastWorkoutDate: null, totalWorkouts: 15 }),
    }),
  );

  await page.route("**/training-sessions/history*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) }),
  );

  await page.route("**/training-sessions/week", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) }),
  );
}

async function mockWorkoutPlans(page: Page) {
  await page.route("**/students/me/workout-plans*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: WORKOUT_PLAN_ID, name: "Treino A - Peito e Tríceps", description: null, planKind: "student", sourceTemplateId: null, studentNames: [], exercises: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]),
    }),
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test("BUG-005: deve exibir botão Iniciar Treino quando há sessão pendente para hoje", async ({ page }) => {
  await mockStudentPainelApis(page);
  await mockWorkoutPlans(page);

  await page.route("**/training-sessions/today", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(makeSession()),
    }),
  );

  await page.goto(PAINEL_URL);

  await expect(page.getByRole("link", { name: "Iniciar Treino" })).toBeVisible();
  await expect(page.getByText("Treino de Hoje")).toBeVisible();
  // Plan name appears in the TodayTrainingCard as a heading (text-2xl)
  await expect(page.getByText("Treino A - Peito e Tríceps").first()).toBeVisible();
});

test("BUG-005: deve exibir horário da sessão no card quando startTime está definido", async ({ page }) => {
  await mockStudentPainelApis(page);
  await mockWorkoutPlans(page);

  await page.route("**/training-sessions/today", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(makeSession({ startTime: "07:00", endTime: "08:00" })),
    }),
  );

  await page.goto(PAINEL_URL);

  await expect(page.getByText("07:00 – 08:00")).toBeVisible();
});

test("BUG-005: deve exibir Sem treino hoje quando não há sessão para o dia", async ({ page }) => {
  await mockStudentPainelApis(page);
  await mockWorkoutPlans(page);

  await page.route("**/training-sessions/today", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "null" }),
  );

  await page.goto(PAINEL_URL);

  await expect(page.getByText("Sem treino hoje")).toBeVisible();
  await expect(page.getByText("Seu personal ainda não configurou a agenda desta semana.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Iniciar Treino" })).not.toBeVisible();
});

test("BUG-005: deve exibir Dia de Descanso quando sessionType é rest", async ({ page }) => {
  await mockStudentPainelApis(page);
  await mockWorkoutPlans(page);

  await page.route("**/training-sessions/today", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(makeSession({ sessionType: "rest", workoutPlanId: null })),
    }),
  );

  await page.goto(PAINEL_URL);

  await expect(page.getByText("Dia de Descanso")).toBeVisible();
  await expect(page.getByRole("link", { name: "Iniciar Treino" })).not.toBeVisible();
});

test("BUG-005: deve exibir botão desabilitado quando sessão está pendente mas sem plano configurado", async ({
  page,
}) => {
  await mockStudentPainelApis(page);
  await mockWorkoutPlans(page);

  await page.route("**/training-sessions/today", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(makeSession({ workoutPlanId: null })),
    }),
  );

  await page.goto(PAINEL_URL);

  await expect(page.getByRole("button", { name: "Treino não configurado" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Treino não configurado" })).toBeDisabled();
});

test("BUG-005: deve exibir Treino Concluído quando sessão já foi completada hoje", async ({ page }) => {
  await mockStudentPainelApis(page);
  await mockWorkoutPlans(page);

  await page.route("**/training-sessions/today", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(makeSession({ status: "completed" })),
    }),
  );

  await page.goto(PAINEL_URL);

  await expect(page.getByText("Treino Concluído!")).toBeVisible();
  await expect(page.getByRole("link", { name: "Iniciar Treino" })).not.toBeVisible();
});
