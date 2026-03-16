import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListPlansUseCase } from "../listPlans.useCase";

const makePlan = (overrides = {}) => ({
  id: "plan-id-1",
  name: "Básico",
  description: "Plano básico",
  price: "29.90",
  maxStudents: 10,
  benefits: ["Gestão de alunos", "Criação de treinos"],
  highlighted: false,
  order: 1,
  stripePriceId: "price_abc123",
  isDefault: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePlansRepository = () => ({
  findAll: vi.fn().mockResolvedValue([
    makePlan(),
    makePlan({
      id: "plan-id-2",
      name: "Pro",
      price: "49.90",
      maxStudents: 30,
      order: 2,
      stripePriceId: "price_def456",
      isDefault: false,
      highlighted: true,
    }),
    makePlan({
      id: "plan-id-3",
      name: "Elite",
      price: "99.90",
      maxStudents: 100,
      order: 3,
      stripePriceId: "price_ghi789",
      isDefault: false,
    }),
  ]),
});

describe("ListPlansUseCase", () => {
  let useCase: ListPlansUseCase;
  let plansRepository: ReturnType<typeof makePlansRepository>;

  beforeEach(() => {
    plansRepository = makePlansRepository();
    useCase = new ListPlansUseCase(plansRepository as any);
  });

  it("should return all active plans", async () => {
    const result = await useCase.execute();

    expect(result).toHaveLength(3);
    expect(plansRepository.findAll).toHaveBeenCalledOnce();
  });

  it("should return correct public fields shape", async () => {
    const result = await useCase.execute();

    expect(result[0]).toEqual({
      id: "plan-id-1",
      name: "Básico",
      description: "Plano básico",
      price: "29.90",
      maxStudents: 10,
      benefits: ["Gestão de alunos", "Criação de treinos"],
      highlighted: false,
      order: 1,
    });
  });

  it("should NOT expose stripePriceId", async () => {
    const result = await useCase.execute();

    for (const plan of result) {
      expect(plan).not.toHaveProperty("stripePriceId");
    }
  });

  it("should NOT expose isDefault, isActive, createdAt, updatedAt", async () => {
    const result = await useCase.execute();

    for (const plan of result) {
      expect(plan).not.toHaveProperty("isDefault");
      expect(plan).not.toHaveProperty("isActive");
      expect(plan).not.toHaveProperty("createdAt");
      expect(plan).not.toHaveProperty("updatedAt");
    }
  });

  it("should return empty array when no plans exist", async () => {
    plansRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it("should preserve plan ordering from repository", async () => {
    const result = await useCase.execute();

    expect(result[0].name).toBe("Básico");
    expect(result[1].name).toBe("Pro");
    expect(result[2].name).toBe("Elite");
    expect(result[0].order).toBe(1);
    expect(result[1].order).toBe(2);
    expect(result[2].order).toBe(3);
  });
});
