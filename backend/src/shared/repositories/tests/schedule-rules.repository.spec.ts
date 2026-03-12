import { describe, it, expect, vi } from "vitest";

import { ScheduleRulesRepository } from "../schedule-rules.repository";

// Extrai nomes de colunas do SQL AST do Drizzle de forma recursiva
function extractColumnNames(node: any): string[] {
  if (!node) return [];
  if (node.columnType && node.name) return [node.name as string];
  if (Array.isArray(node.queryChunks)) {
    return node.queryChunks.flatMap(extractColumnNames);
  }
  return [];
}

function makeMockDb(returnValue: unknown = []) {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(returnValue),
      }),
    }),
  };
}

describe("ScheduleRulesRepository", () => {
  describe("findByStudent", () => {
    it("deve filtrar por personalId E studentId para garantir isolamento de tenant", async () => {
      let capturedCondition: unknown = null;

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockImplementation((condition) => {
              capturedCondition = condition;
              return Promise.resolve([]);
            }),
          }),
        }),
      };

      const repo = new ScheduleRulesRepository({ db: mockDb } as any);
      await repo.findByStudent("student-abc", "personal-xyz");

      const columns = extractColumnNames(capturedCondition);
      expect(columns, "WHERE deve filtrar por personal_id (isolamento de tenant)").toContain("personal_id");
      expect(columns, "WHERE deve filtrar por student_id").toContain("student_id");
    });

    it("deve retornar as regras do aluno encontradas", async () => {
      const mockRules = [
        {
          id: "rule-1",
          personalId: "personal-xyz",
          studentId: "student-abc",
          dayOfWeek: 1,
          sessionType: "online" as const,
          isActive: true,
        },
        {
          id: "rule-2",
          personalId: "personal-xyz",
          studentId: "student-abc",
          dayOfWeek: 3,
          sessionType: "presential" as const,
          isActive: true,
        },
      ];

      const repo = new ScheduleRulesRepository({ db: makeMockDb(mockRules) } as any);
      const result = await repo.findByStudent("student-abc", "personal-xyz");

      expect(result).toEqual(mockRules);
    });

    it("deve retornar array vazio quando não há regras configuradas", async () => {
      const repo = new ScheduleRulesRepository({ db: makeMockDb([]) } as any);
      const result = await repo.findByStudent("student-abc", "personal-xyz");

      expect(result).toEqual([]);
    });
  });
});
