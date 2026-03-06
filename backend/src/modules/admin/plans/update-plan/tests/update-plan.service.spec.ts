import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdatePlanService } from "../update-plan.service";

const mockPlan = {
  id: "plan-1",
  name: "Pro",
  description: "Plano Pro",
  price: "29.90",
  benefits: ["Ate 10 alunos"],
  highlighted: true,
  order: 1,
  maxStudents: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UpdatePlanService", () => {
  let service: UpdatePlanService;
  let plansRepository: {
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    plansRepository = {
      findById: vi.fn().mockResolvedValue(mockPlan),
      update: vi.fn().mockResolvedValue({ ...mockPlan, price: "39.90" }),
    };
    service = new UpdatePlanService(plansRepository as any);
  });

  describe("execute", () => {
    it("should update and return the plan", async () => {
      const result = await service.execute("plan-1", { price: "39.90" });

      expect(result.price).toBe("39.90");
      expect(plansRepository.update).toHaveBeenCalledWith("plan-1", { price: "39.90" });
    });

    it("should throw NotFoundException when plan not found", async () => {
      plansRepository.findById.mockResolvedValue(null);

      await expect(service.execute("nonexistent", { price: "39.90" })).rejects.toThrow(NotFoundException);
    });
  });
});
