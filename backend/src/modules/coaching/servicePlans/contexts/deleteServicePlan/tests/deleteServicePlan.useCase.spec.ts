import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteServicePlanUseCase } from "../deleteServicePlan.useCase";

const makePlan = (overrides = {}) => ({
  id: "plan-id-1",
  tenantId: "tenant-id-1",
  name: "Consultoria Online",
  description: null,
  price: "49.90",
  sessionsPerWeek: null,
  durationMinutes: null,
  attendanceType: "online" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePlan()),
  delete: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteServicePlanUseCase", () => {
  let useCase: DeleteServicePlanUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new DeleteServicePlanUseCase(repository as any);
  });

  it("should delete a service plan successfully", async () => {
    await useCase.execute("plan-id-1", tenantId);

    expect(repository.delete).toHaveBeenCalledWith("plan-id-1", tenantId);
  });

  it("should throw NotFoundException when plan does not exist", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when plan belongs to another tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("plan-id-1", "other-tenant")).rejects.toThrow(NotFoundException);
  });
});
