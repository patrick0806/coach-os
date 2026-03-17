import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateServicePlanUseCase } from "../updateServicePlan.useCase";

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
  update: vi.fn().mockResolvedValue(makePlan({ name: "Updated Name" })),
});

describe("UpdateServicePlanUseCase", () => {
  let useCase: UpdateServicePlanUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new UpdateServicePlanUseCase(repository as any);
  });

  it("should update a service plan successfully", async () => {
    const result = await useCase.execute("plan-id-1", { name: "Updated Name" }, tenantId);

    expect(result.name).toBe("Updated Name");
    expect(repository.update).toHaveBeenCalledWith("plan-id-1", tenantId, { name: "Updated Name" });
  });

  it("should throw NotFoundException when plan does not exist", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", { name: "Name" }, tenantId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException when plan belongs to another tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("plan-id-1", { name: "Name" }, "other-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow partial updates", async () => {
    await useCase.execute("plan-id-1", { isActive: false }, tenantId);

    expect(repository.update).toHaveBeenCalledWith("plan-id-1", tenantId, { isActive: false });
  });

  it("should throw ValidationException when name is too short", async () => {
    await expect(useCase.execute("plan-id-1", { name: "" }, tenantId)).rejects.toThrow();
  });
});
