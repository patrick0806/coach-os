import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListAdminPlansService } from "../list-admin-plans.service";

const mockPlans = [
  { id: "plan-1", name: "Basico", isActive: true, order: 0 },
  { id: "plan-2", name: "Pro", isActive: true, order: 1 },
  { id: "plan-3", name: "Inativo", isActive: false, order: 2 },
];

describe("ListAdminPlansService", () => {
  let service: ListAdminPlansService;
  let plansRepository: { findAll: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    plansRepository = { findAll: vi.fn().mockResolvedValue(mockPlans) };
    service = new ListAdminPlansService(plansRepository as any);
  });

  describe("execute", () => {
    it("should return all plans including inactive ones", async () => {
      const result = await service.execute();

      expect(result).toEqual(mockPlans);
      expect(result).toHaveLength(3);
    });
  });
});
