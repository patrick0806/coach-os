import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { DeletePlanUseCase } from "../deletePlan.useCase";

const makePlansRepository = () => ({
  deleteById: vi.fn().mockResolvedValue(undefined),
});

const makePersonalsRepository = () => ({
  countBySubscriptionPlanId: vi.fn().mockResolvedValue(0),
});

describe("DeletePlanUseCase", () => {
  let useCase: DeletePlanUseCase;
  let plansRepository: ReturnType<typeof makePlansRepository>;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;

  beforeEach(() => {
    plansRepository = makePlansRepository();
    personalsRepository = makePersonalsRepository();
    useCase = new DeletePlanUseCase(plansRepository as any, personalsRepository as any);
  });

  it("should soft delete a plan when no coaches are using it", async () => {
    await useCase.execute("plan-1");
    expect(plansRepository.deleteById).toHaveBeenCalledWith("plan-1");
  });

  it("should throw BadRequestException when coaches are using the plan", async () => {
    personalsRepository.countBySubscriptionPlanId.mockResolvedValue(3);

    await expect(useCase.execute("plan-1")).rejects.toThrow(BadRequestException);
    expect(plansRepository.deleteById).not.toHaveBeenCalled();
  });
});
