import { describe, it, expect, vi } from "vitest";

import { TrainingSessionsRepository } from "../training-sessions.repository";
import { trainingSessions } from "@config/database/schema/schedule";

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
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(returnValue),
          orderBy: vi.fn().mockResolvedValue(returnValue),
          // Without chaining — direct resolved value for non-limited queries
          then: vi.fn().mockImplementation((resolve: any) => resolve(returnValue)),
          [Symbol.iterator]: undefined,
        }),
        // For queries without where (e.g. select without where)
        limit: vi.fn().mockResolvedValue(returnValue),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(returnValue),
        }),
      }),
    }),
  };
}

function captureWhereMockDb() {
  let capturedCondition: unknown = null;
  const db = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation((condition) => {
          capturedCondition = condition;
          return {
            limit: vi.fn().mockResolvedValue([]),
            orderBy: vi.fn().mockResolvedValue([]),
          };
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation((condition) => {
          capturedCondition = condition;
          return { returning: vi.fn().mockResolvedValue([]) };
        }),
      }),
    }),
  };
  return { db, getCondition: () => capturedCondition };
}

describe("TrainingSessionsRepository", () => {
  describe("findTodayByStudent", () => {
    it("deve filtrar por personalId E studentId para isolamento de tenant", async () => {
      const { db, getCondition } = captureWhereMockDb();
      const repo = new TrainingSessionsRepository({ db } as any);

      await repo.findTodayByStudent("student-abc", "personal-xyz");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id").toContain("personal_id");
      expect(columns, "WHERE deve conter student_id").toContain("student_id");
    });
  });

  describe("findWeekByStudent", () => {
    it("deve filtrar por personalId E studentId para isolamento de tenant", async () => {
      const { db, getCondition } = captureWhereMockDb();
      const repo = new TrainingSessionsRepository({ db } as any);

      await repo.findWeekByStudent("student-abc", "personal-xyz");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id").toContain("personal_id");
      expect(columns, "WHERE deve conter student_id").toContain("student_id");
    });
  });

  describe("findByStudent", () => {
    it("deve filtrar por personalId E studentId para isolamento de tenant", async () => {
      const { db, getCondition } = captureWhereMockDb();
      const repo = new TrainingSessionsRepository({ db } as any);

      await repo.findByStudent("student-abc", "personal-xyz");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id").toContain("personal_id");
      expect(columns, "WHERE deve conter student_id").toContain("student_id");
    });
  });

  describe("findHistoryByStudent", () => {
    it("deve filtrar por personalId E studentId para isolamento de tenant", async () => {
      const { db, getCondition } = captureWhereMockDb();
      const repo = new TrainingSessionsRepository({ db } as any);

      await repo.findHistoryByStudent("student-abc", "personal-xyz", "2026-01-01", "2026-03-01");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id").toContain("personal_id");
      expect(columns, "WHERE deve conter student_id").toContain("student_id");
    });
  });

  describe("updateStatus", () => {
    it("deve filtrar por personalId E id na atualização para isolamento de tenant", async () => {
      const { db, getCondition } = captureWhereMockDb();
      const repo = new TrainingSessionsRepository({ db } as any);

      await repo.updateStatus("session-1", "completed", "personal-xyz");

      const columns = extractColumnNames(getCondition());
      expect(columns, "WHERE deve conter personal_id na mutation").toContain("personal_id");
      expect(columns, "WHERE deve conter id na mutation").toContain("id");
    });
  });
});
