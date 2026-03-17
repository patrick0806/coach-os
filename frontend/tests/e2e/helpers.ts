import { randomUUID } from "crypto";

export function generateUniqueEmail(): string {
  const id = randomUUID().slice(0, 8);
  return `e2e-${id}@test.com`;
}

export const TEST_PASSWORD = "Test1234";

export const TEST_USER = {
  name: "E2E Test User",
  password: TEST_PASSWORD,
};
