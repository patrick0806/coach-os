import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListPlansUseCase } from "../listPlans.useCase";

const makePlan = (overrides = {}) => ({
  id: "plan-1",
  name: "Básico",
  price: "29.90",
  maxStudents: 10,
  isActive: true,
  order: 1,
  ...overrides,
});

const makePlansRepository = () => ({
  findAllAdmin: vi.fn().mockResolvedValue([makePlan()]),
});

describe("ListPlansUseCase", () => {
  let useCase: ListPlansUseCase;
  let plansRepository: ReturnType<typeof makePlansRepository>;

  beforeEach(() => {
    plansRepository = makePlansRepository();
    useCase = new ListPlansUseCase(plansRepository as any);
  });

  it("should return all plans including inactive", async () => {
    const result = await useCase.execute();
    expect(result).toHaveLength(1);
    expect(plansRepository.findAllAdmin).toHaveBeenCalled();
  });
});
