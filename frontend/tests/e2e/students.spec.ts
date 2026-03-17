import { test, expect } from "@playwright/test";
import { loginAsDemoCoach, generateUniqueName, generateUniqueEmail } from "./helpers";

// Seed students expected to be present for the demo coach
const SEED_STUDENTS = ["Fernanda Costa", "Carlos Mendonça", "Ana Paula Silva"];

test.describe("Students — List & Filters", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/students");
    await page.locator("table").waitFor({ state: "visible" });
  });

  test("loads pre-seeded students", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
    for (const name of SEED_STUDENTS) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });

  test("search by name filters the list", async ({ page }) => {
    await page.getByPlaceholder("Buscar por nome ou email...").fill("Fernanda");
    // waitForURL naturally absorbs the 400ms debounce before the URL is updated
    await page.waitForURL(/search=Fernanda/, { timeout: 5000 });

    await expect(page.getByText("Fernanda Costa")).toBeVisible();
    await expect(page.getByText("Carlos Mendonça")).not.toBeVisible();
  });

  test("status tab Ativos shows only active students", async ({ page }) => {
    await page.getByRole("tab", { name: "Ativos" }).click();
    await page.waitForURL(/status=active/);

    // All seed students are active — they should still be visible
    for (const name of SEED_STUDENTS) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });

  test("status tab Arquivados shows empty state", async ({ page }) => {
    await page.getByRole("tab", { name: "Arquivados" }).click();
    await page.waitForURL(/status=archived/);

    await expect(page.getByText("Nenhum aluno encontrado")).toBeVisible();
  });
});

test.describe("Students — Create", () => {
  test.describe.configure({ mode: "serial" });

  let createdStudentName: string;
  let createdStudentEmail: string;

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/students");
    await page.locator("table").waitFor({ state: "visible" });
  });

  test("creates new student with required fields", async ({ page }) => {
    createdStudentName = generateUniqueName();
    createdStudentEmail = generateUniqueEmail();

    await page.getByRole("button", { name: "Novo aluno" }).click();
    await expect(page.getByRole("heading", { name: "Novo aluno" })).toBeVisible();

    await page.locator("#name").fill(createdStudentName);
    await page.locator("#email").fill(createdStudentEmail);

    await page.getByRole("button", { name: "Salvar" }).click();

    // Dialog should close
    await expect(page.getByRole("heading", { name: "Novo aluno" })).not.toBeVisible();

    // Student should appear in the list
    await expect(page.getByText(createdStudentName)).toBeVisible();
  });

  test("student appears in list after creation", async ({ page }) => {
    // createdStudentName is set in the previous serial test
    if (!createdStudentName) test.skip();

    await page.getByPlaceholder("Buscar por nome ou email...").fill(createdStudentName);
    await page.waitForURL(/search=/);
    await expect(page.getByText(createdStudentName)).toBeVisible();
  });
});

test.describe("Students — Invite Link", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/students");
    await page.locator("table").waitFor({ state: "visible" });
  });

  test("generates invite link for new student", async ({ page }) => {
    await page.getByRole("button", { name: "Convidar externo" }).click();
    await expect(page.getByRole("heading", { name: "Convidar aluno" })).toBeVisible();

    const name = generateUniqueName();
    const email = generateUniqueEmail();

    await page.locator("#invite-name").fill(name);
    await page.locator("#invite-email").fill(email);

    await page.getByRole("button", { name: "Gerar link" }).click();

    // Step "link" — share link text is visible
    await expect(page.getByText("Compartilhe este link")).toBeVisible();

    // The link is shown in monospace
    const linkText = page.locator("p.font-mono");
    await expect(linkText).toBeVisible();
    await expect(linkText).not.toBeEmpty();

    // Grant clipboard permission so navigator.clipboard.writeText succeeds in headless mode
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: "Copiar link" }).click();
    await expect(page.getByText("Copiado!")).toBeVisible();
  });
});

test.describe("Students — Mobile", () => {
  // Only viewport can be set inside a describe — browserName/defaultBrowserType force a new worker
  test.use({ viewport: { width: 412, height: 915 } });

  test.beforeEach(async ({ page }) => {
    await loginAsDemoCoach(page);
    await page.goto("/students");
    await page.locator("table").waitFor({ state: "visible" });
  });

  test("student list renders on mobile", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();

    // "Cadastrado em" column is hidden on mobile (hidden sm:table-cell)
    const registeredHeader = page.getByRole("columnheader", { name: "Cadastrado em" });
    await expect(registeredHeader).not.toBeVisible();

    await expect(page.getByText("Fernanda Costa")).toBeVisible();
  });

  test("search works on mobile", async ({ page }) => {
    await page.getByPlaceholder("Buscar por nome ou email...").fill("Fernanda");
    await page.waitForURL(/search=Fernanda/, { timeout: 5000 });

    await expect(page.getByText("Fernanda Costa")).toBeVisible();
    await expect(page.getByText("Carlos Mendonça")).not.toBeVisible();
  });

  test("create dialog opens on mobile", async ({ page }) => {
    await page.getByRole("button", { name: "Novo aluno" }).click();
    await expect(page.getByRole("heading", { name: "Novo aluno" })).toBeVisible();

    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
  });
});
