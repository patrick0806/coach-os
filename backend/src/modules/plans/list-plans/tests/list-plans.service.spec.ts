import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListPlansService } from "../list-plans.service";

const mockPlans = [
  {
    id: "plan-1",
    name: "Basico",
    description: "O plano perfeito para quem esta comecando",
    price: "19.90",
    highlighted: false,
    order: 0,
    benefits: ["Ate 3 alunos", "Agenda personalizada", "Planilhas de treinos"],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "plan-2",
    name: "Pro",
    description: "O plano perfeito para quem esta voando",
    price: "29.90",
    highlighted: true,
    order: 1,
    benefits: ["Ate 10 alunos", "Agenda personalizada", "Planilhas de treinos"],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("ListPlansService", () => {
  let service: ListPlansService;
  let plansRepository: { findAllActive: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    plansRepository = { findAllActive: vi.fn() };
    service = new ListPlansService(plansRepository as any);
  });

  describe("execute", () => {
    it("should return all active plans ordered by order field", async () => {
      plansRepository.findAllActive.mockResolvedValue(mockPlans);

      const result = await service.execute();

      expect(plansRepository.findAllActive).toHaveBeenCalledOnce();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Basico");
      expect(result[1].name).toBe("Pro");
    });

    it("should return benefits as string array", async () => {
      plansRepository.findAllActive.mockResolvedValue(mockPlans);

      const result = await service.execute();

      expect(Array.isArray(result[0].benefits)).toBe(true);
      expect(result[0].benefits).toContain("Ate 3 alunos");
    });

    it("should return empty array when no active plans exist", async () => {
      plansRepository.findAllActive.mockResolvedValue([]);

      const result = await service.execute();

      expect(result).toEqual([]);
    });

    it("should include highlighted flag on plans", async () => {
      plansRepository.findAllActive.mockResolvedValue(mockPlans);

      const result = await service.execute();

      expect(result[0].highlighted).toBe(false);
      expect(result[1].highlighted).toBe(true);
    });
  });
});
