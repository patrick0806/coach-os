import { describe, it, expect, vi } from "vitest";

import { StudentNotesRepository } from "../student-notes.repository";

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
          return { returning: vi.fn().mockResolvedValue([]) };
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

describe("StudentNotesRepository", () => {
  describe("update", () => {
    it("deve filtrar por personalId E id para evitar mutação cross-tenant", async () => {
      const { db, getCondition } = captureMutateMockDb();
      const repo = new StudentNotesRepository({ db } as any);

      await repo.update("note-1", "conteúdo atualizado", "personal-xyz");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id").toContain("personal_id");
      expect(columns, "WHERE deve conter id").toContain("id");
    });
  });

  describe("delete", () => {
    it("deve filtrar por personalId E id para evitar deleção cross-tenant", async () => {
      const { db, getCondition } = captureMutateMockDb();
      const repo = new StudentNotesRepository({ db } as any);

      await repo.delete("note-1", "personal-xyz");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id").toContain("personal_id");
      expect(columns, "WHERE deve conter id").toContain("id");
    });
  });
});
