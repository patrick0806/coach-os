import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListPlansController } from "../list-plans.controller";

const mockPlans = [
  {
    id: "plan-1",
    name: "Basico",
    description: "O plano perfeito para quem esta comecando",
    price: "19.90",
    highlighted: false,
    order: 0,
    benefits: ["Ate 3 alunos", "Agenda personalizada"],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("ListPlansController", () => {
  let controller: ListPlansController;
  let listPlansService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    listPlansService = { execute: vi.fn() };
    controller = new ListPlansController(listPlansService as any);
  });

  describe("handle", () => {
    it("should return plans from service", async () => {
      listPlansService.execute.mockResolvedValue(mockPlans);

      const result = await controller.handle();

      expect(listPlansService.execute).toHaveBeenCalledOnce();
      expect(result).toEqual(mockPlans);
    });
  });
});
