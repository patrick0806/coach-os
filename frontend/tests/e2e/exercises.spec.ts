import { test, expect } from "@playwright/test";
import { loginAsDemoCoach, generateUniqueName } from "./helpers";

test.describe("Exercise Library — List & Filters", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/exercises");
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 });
  });

  test("navigates to exercises page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Exercícios" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar exercício" })).toBeVisible();
  });

  test("shows global exercises by default", async ({ page }) => {
    // Global exercises have the "Plataforma" badge
    const platformBadge = page.getByText("Plataforma").first();
    await expect(platformBadge).toBeVisible();
  });

  test("search filters exercises", async ({ page }) => {
    await page.getByPlaceholder("Buscar por nome...").fill("Supino");
    await page.waitForURL(/search=Supino/, { timeout: 5000 });

    // At least one result should be visible (global exercise)
    await expect(page.getByText("Supino", { exact: false }).first()).toBeVisible();
  });

  test("shows empty state when no results", async ({ page }) => {
    await page.getByPlaceholder("Buscar por nome...").fill("xyznonexistentexercise123");
    await page.waitForURL(/search=xyznonexistentexercise123/, { timeout: 5000 });

    await expect(page.getByText("Nenhum exercício encontrado")).toBeVisible();
  });
});

test.describe("Create Exercise", () => {
  test.describe.configure({ mode: "serial" });

  let createdExerciseName: string;

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/exercises");
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 });
  });

  test("opens create dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Criar exercício" }).click();
    await expect(page.getByRole("heading", { name: "Novo exercício" })).toBeVisible();
    await expect(page.locator("#exercise-name")).toBeVisible();
    await expect(page.locator("#exercise-muscleGroup")).toBeVisible();
  });

  test("validates required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Criar exercício" }).click();
    await expect(page.getByRole("heading", { name: "Novo exercício" })).toBeVisible();

    // Submit empty form
    await page.getByRole("button", { name: "Salvar" }).click();

    // Zod validation errors should appear
    await expect(page.getByText("Nome deve ter ao menos 2 caracteres")).toBeVisible();
  });

  test("creates private exercise", async ({ page }) => {
    createdExerciseName = `E2E ${generateUniqueName()}`;

    await page.getByRole("button", { name: "Criar exercício" }).click();
    await expect(page.getByRole("heading", { name: "Novo exercício" })).toBeVisible();

    await page.locator("#exercise-name").fill(createdExerciseName);

    // Select muscle group
    await page.locator("#exercise-muscleGroup").click();
    await page.getByRole("option", { name: "Peitoral" }).click();

    await page.getByRole("button", { name: "Salvar" }).click();

    // Dialog should close
    await expect(page.getByRole("heading", { name: "Novo exercício" })).not.toBeVisible();

    // Exercise should appear in the grid with "Meu" badge
    await expect(page.getByText(createdExerciseName)).toBeVisible();
  });

  test("created exercise appears in list after navigation", async ({ page }) => {
    if (!createdExerciseName) test.skip();

    await page.getByPlaceholder("Buscar por nome...").fill(createdExerciseName);
    await page.waitForURL(/search=/, { timeout: 5000 });

    await expect(page.getByText(createdExerciseName)).toBeVisible();
    // Should have "Meu" badge (private exercise)
    await expect(page.getByText("Meu")).toBeVisible();
  });
});

test.describe("Edit Exercise", () => {
  test.describe.configure({ mode: "serial" });

  let exerciseName: string;
  let updatedName: string;

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/exercises");
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 });
  });

  test("cannot edit global exercise", async ({ page }) => {
    // Hover a card with Plataforma badge to reveal actions
    const platformCard = page.locator(".group").filter({ hasText: "Plataforma" }).first();
    await platformCard.hover();

    await platformCard.locator("[data-testid='exercise-actions']").click();

    const editItem = page.getByTestId("edit-exercise");
    await expect(editItem).toBeVisible();
    await expect(editItem).toBeDisabled();
  });

  test("creates exercise then opens edit dialog", async ({ page }) => {
    exerciseName = `E2E Edit ${generateUniqueName()}`;
    updatedName = `${exerciseName} Updated`;

    // Create the exercise first
    await page.getByRole("button", { name: "Criar exercício" }).click();
    await page.locator("#exercise-name").fill(exerciseName);
    await page.locator("#exercise-muscleGroup").click();
    await page.getByRole("option", { name: "Costas" }).click();
    await page.getByRole("button", { name: "Salvar" }).click();

    // Wait for the exercise to appear
    await expect(page.getByText(exerciseName)).toBeVisible();

    // Hover the card and open edit
    const myCard = page.locator(".group").filter({ hasText: exerciseName }).first();
    await myCard.hover();
    await myCard.locator("[data-testid='exercise-actions']").click();
    await page.getByTestId("edit-exercise").click();

    await expect(page.getByRole("heading", { name: "Editar exercício" })).toBeVisible();
  });

  test("updates exercise name", async ({ page }) => {
    if (!exerciseName) test.skip();

    // Search for the exercise
    await page.getByPlaceholder("Buscar por nome...").fill(exerciseName);
    await page.waitForURL(/search=/, { timeout: 5000 });
    await expect(page.getByText(exerciseName)).toBeVisible();

    const myCard = page.locator(".group").filter({ hasText: exerciseName }).first();
    await myCard.hover();
    await myCard.locator("[data-testid='exercise-actions']").click();
    await page.getByTestId("edit-exercise").click();

    await expect(page.getByRole("heading", { name: "Editar exercício" })).toBeVisible();

    await page.locator("#exercise-name").clear();
    await page.locator("#exercise-name").fill(updatedName);

    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByRole("heading", { name: "Editar exercício" })).not.toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();
  });
});

test.describe("Delete Exercise", () => {
  test.describe.configure({ mode: "serial" });

  let exerciseName: string;

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/exercises");
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 });
  });

  test("cannot delete global exercise", async ({ page }) => {
    const platformCard = page.locator(".group").filter({ hasText: "Plataforma" }).first();
    await platformCard.hover();
    await platformCard.locator("[data-testid='exercise-actions']").click();

    const deleteItem = page.getByTestId("delete-exercise");
    await expect(deleteItem).toBeVisible();
    await expect(deleteItem).toBeDisabled();
  });

  test("deletes private exercise with confirmation", async ({ page }) => {
    exerciseName = `E2E Delete ${generateUniqueName()}`;

    // Create exercise to delete
    await page.getByRole("button", { name: "Criar exercício" }).click();
    await page.locator("#exercise-name").fill(exerciseName);
    await page.locator("#exercise-muscleGroup").click();
    await page.getByRole("option", { name: "Funcional" }).click();
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText(exerciseName)).toBeVisible();

    // Delete the exercise
    const myCard = page.locator(".group").filter({ hasText: exerciseName }).first();
    await myCard.hover();
    await myCard.locator("[data-testid='exercise-actions']").click();
    await page.getByTestId("delete-exercise").click();

    // Confirmation dialog
    await expect(page.getByRole("heading", { name: "Excluir exercício" })).toBeVisible();
    await page.getByRole("button", { name: "Excluir" }).click();

    // Exercise should disappear
    await expect(page.getByText(exerciseName)).not.toBeVisible();
  });
});

test.describe("Exercise Detail", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/exercises");
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 });
  });

  test("opens detail dialog", async ({ page }) => {
    // Open detail of the first global exercise
    const firstCard = page.locator(".group").first();
    await firstCard.hover();
    await firstCard.locator("[data-testid='exercise-actions']").click();
    await page.getByRole("menuitem", { name: "Ver detalhes" }).click();

    // Dialog should open with exercise info
    await expect(page.getByRole("dialog")).toBeVisible();
    // Badge should be visible
    await expect(page.getByText("Plataforma").last()).toBeVisible();
  });
});

test.describe("Mobile View", () => {
  test.use({ viewport: { width: 412, height: 915 } });

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/exercises");
    await page.waitForSelector("[data-slot='empty-state'], .grid", { timeout: 8000 });
  });

  test("shows exercise grid on mobile", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Exercícios" })).toBeVisible();
    // Grid is present (at least one card)
    await expect(page.locator(".group").first()).toBeVisible();
  });

  test("search works on mobile", async ({ page }) => {
    await page.getByPlaceholder("Buscar por nome...").fill("Supino");
    await page.waitForURL(/search=Supino/, { timeout: 5000 });

    await expect(page.getByText("Supino", { exact: false }).first()).toBeVisible();
  });
});
