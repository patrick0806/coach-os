import { describe, it, expect, beforeEach, vi } from "vitest";

import { CreatePlanService } from "../create-plan.service";

const mockInput = {
  name: "Enterprise",
  description: "Plano enterprise",
  price: "99.90",
  benefits: ["Alunos ilimitados", "Suporte dedicado"],
  highlighted: false,
  order: 3,
  maxStudents: null,
};

const mockPlan = {
  id: "plan-new",
  ...mockInput,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CreatePlanService", () => {
  let service: CreatePlanService;
  let plansRepository: { create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    plansRepository = { create: vi.fn().mockResolvedValue(mockPlan) };
    service = new CreatePlanService(plansRepository as any);
  });

  describe("execute", () => {
    it("should create and return a new plan", async () => {
      const result = await service.execute(mockInput);

      expect(result).toEqual(mockPlan);
      expect(plansRepository.create).toHaveBeenCalledWith(mockInput);
    });
  });
});
