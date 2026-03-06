import { describe, it, expect, beforeEach, vi } from "vitest";

import { ReorderPlansService } from "../reorder-plans.service";

describe("ReorderPlansService", () => {
  let service: ReorderPlansService;
  let plansRepository: { updateOrder: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    plansRepository = { updateOrder: vi.fn().mockResolvedValue(undefined) };
    service = new ReorderPlansService(plansRepository as any);
  });

  describe("execute", () => {
    it("should call repository with the reorder list", async () => {
      const items = [
        { id: "plan-1", order: 2 },
        { id: "plan-2", order: 0 },
        { id: "plan-3", order: 1 },
      ];

      await service.execute(items);

      expect(plansRepository.updateOrder).toHaveBeenCalledWith(items);
    });
  });
});
