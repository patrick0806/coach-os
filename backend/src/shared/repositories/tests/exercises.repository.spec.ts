import { describe, it, expect, vi } from "vitest";

import { ExercisesRepository } from "../exercises.repository";

function extractColumnNames(node: any): string[] {
  if (!node) return [];
  if (node.columnType && node.name) return [node.name as string];
  if (Array.isArray(node.queryChunks)) {
    return node.queryChunks.flatMap(extractColumnNames);
  }
  return [];
}

function captureMutateMockDb() {
  let capturedCondition: unknown = null;
  const db = {
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation((condition) => {
          capturedCondition = condition;
          return Promise.resolve();
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockImplementation((condition) => {
        capturedCondition = condition;
        return Promise.resolve();
      }),
    }),
  };
  return { db, getCondition: () => capturedCondition };
}

describe("ExercisesRepository", () => {
  describe("updateYoutubeUrl", () => {
    it("deve filtrar por personalId E exerciseId para evitar mutação cross-tenant", async () => {
      const { db, getCondition } = captureMutateMockDb();
      const repo = new ExercisesRepository({ db } as any);

      await repo.updateYoutubeUrl("exercise-1", "https://youtube.com/watch?v=abc", "personal-xyz");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id").toContain("personal_id");
      expect(columns, "WHERE deve conter id").toContain("id");
    });
  });

  describe("delete", () => {
    it("deve filtrar por personalId E id para evitar deleção cross-tenant", async () => {
      const { db, getCondition } = captureMutateMockDb();
      const repo = new ExercisesRepository({ db } as any);

      await repo.delete("exercise-1", "personal-xyz");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id").toContain("personal_id");
      expect(columns, "WHERE deve conter id").toContain("id");
    });
  });
});
