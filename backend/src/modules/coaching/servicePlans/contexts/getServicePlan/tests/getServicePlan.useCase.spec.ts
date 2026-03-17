import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetServicePlanUseCase } from "../getServicePlan.useCase";

const makePlan = (overrides = {}) => ({
  id: "plan-id-1",
  tenantId: "tenant-id-1",
  name: "Consultoria Online",
  description: "Acompanhamento online",
  price: "49.90",
  sessionsPerWeek: 3,
  durationMinutes: 60,
  attendanceType: "online" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePlan()),
});

describe("GetServicePlanUseCase", () => {
  let useCase: GetServicePlanUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new GetServicePlanUseCase(repository as any);
  });

  it("should return the service plan when found", async () => {
    const result = await useCase.execute("plan-id-1", tenantId);

    expect(result.id).toBe("plan-id-1");
    expect(repository.findById).toHaveBeenCalledWith("plan-id-1", tenantId);
  });

  it("should throw NotFoundException when plan does not exist", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when plan belongs to another tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("plan-id-1", "other-tenant-id")).rejects.toThrow(NotFoundException);
  });

  it("should return plan with all fields including optional ones", async () => {
    const result = await useCase.execute("plan-id-1", tenantId);

    expect(result.description).toBe("Acompanhamento online");
    expect(result.sessionsPerWeek).toBe(3);
    expect(result.durationMinutes).toBe(60);
  });
});
