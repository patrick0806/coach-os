import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { TogglePlanStatusService } from "../toggle-plan-status.service";

const mockPlan = { id: "plan-1", name: "Pro", isActive: true };

describe("TogglePlanStatusService", () => {
  let service: TogglePlanStatusService;
  let plansRepository: {
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    plansRepository = {
      findById: vi.fn().mockResolvedValue(mockPlan),
      updateStatus: vi.fn().mockResolvedValue({ ...mockPlan, isActive: false }),
    };
    service = new TogglePlanStatusService(plansRepository as any);
  });

  describe("execute", () => {
    it("should deactivate a plan", async () => {
      await service.execute("plan-1", false);

      expect(plansRepository.updateStatus).toHaveBeenCalledWith("plan-1", false);
    });

    it("should activate a plan", async () => {
      await service.execute("plan-1", true);

      expect(plansRepository.updateStatus).toHaveBeenCalledWith("plan-1", true);
    });

    it("should throw NotFoundException when plan not found", async () => {
      plansRepository.findById.mockResolvedValue(null);

      await expect(service.execute("nonexistent", false)).rejects.toThrow(NotFoundException);
    });
  });
});
