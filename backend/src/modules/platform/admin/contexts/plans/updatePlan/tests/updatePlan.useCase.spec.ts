import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { UpdatePlanUseCase } from "../updatePlan.useCase";

const makePlan = () => ({ id: "plan-1", name: "Pro", price: "49.90", maxStudents: 30 });

const makePlansRepository = (plan = makePlan()) => ({
  update: vi.fn().mockResolvedValue(plan),
});

describe("UpdatePlanUseCase", () => {
  let useCase: UpdatePlanUseCase;
  let plansRepository: ReturnType<typeof makePlansRepository>;

  beforeEach(() => {
    plansRepository = makePlansRepository();
    useCase = new UpdatePlanUseCase(plansRepository as any);
  });

  it("should update a plan", async () => {
    const result = await useCase.execute("plan-1", { name: "Pro" });
    expect(result).toEqual(makePlan());
    expect(plansRepository.update).toHaveBeenCalledWith("plan-1", { name: "Pro" });
  });

  it("should throw NotFoundException when plan not found", async () => {
    plansRepository.update.mockResolvedValue(undefined);
    await expect(useCase.execute("plan-999", { name: "Pro" })).rejects.toThrow(NotFoundException);
  });
});
