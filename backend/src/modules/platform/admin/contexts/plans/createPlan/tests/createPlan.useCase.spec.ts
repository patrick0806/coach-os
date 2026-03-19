import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreatePlanUseCase } from "../createPlan.useCase";

const makePlan = () => ({ id: "plan-1", name: "Básico", price: "29.90", maxStudents: 10 });

const makePlansRepository = () => ({
  create: vi.fn().mockResolvedValue(makePlan()),
});

describe("CreatePlanUseCase", () => {
  let useCase: CreatePlanUseCase;
  let plansRepository: ReturnType<typeof makePlansRepository>;

  beforeEach(() => {
    plansRepository = makePlansRepository();
    useCase = new CreatePlanUseCase(plansRepository as any);
  });

  it("should create a plan", async () => {
    const result = await useCase.execute({ name: "Básico", price: "29.90", maxStudents: 10 });
    expect(result).toEqual(makePlan());
    expect(plansRepository.create).toHaveBeenCalledWith({ name: "Básico", price: "29.90", maxStudents: 10 });
  });

  it("should throw on invalid data", async () => {
    await expect(useCase.execute({ name: "" })).rejects.toThrow();
  });
});
