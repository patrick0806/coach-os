import { describe, it, expect, beforeEach, vi } from "vitest";
import { DeletePlanUseCase } from "../deletePlan.useCase";

const makePlansRepository = () => ({
  deleteById: vi.fn().mockResolvedValue(undefined),
});

describe("DeletePlanUseCase", () => {
  let useCase: DeletePlanUseCase;
  let plansRepository: ReturnType<typeof makePlansRepository>;

  beforeEach(() => {
    plansRepository = makePlansRepository();
    useCase = new DeletePlanUseCase(plansRepository as any);
  });

  it("should soft delete a plan", async () => {
    await useCase.execute("plan-1");
    expect(plansRepository.deleteById).toHaveBeenCalledWith("plan-1");
  });
});
