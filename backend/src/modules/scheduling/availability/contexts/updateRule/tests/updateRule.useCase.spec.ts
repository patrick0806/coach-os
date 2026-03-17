import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, ConflictException } from "@nestjs/common";

import { UpdateAvailabilityRuleUseCase } from "../updateRule.useCase";

const RULE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeRule = (overrides = {}) => ({
  id: RULE_ID,
  tenantId: TENANT_ID,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeRule()),
  findByDayOfWeek: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockResolvedValue(makeRule({ startTime: "09:00" })),
});

describe("UpdateAvailabilityRuleUseCase", () => {
  let useCase: UpdateAvailabilityRuleUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new UpdateAvailabilityRuleUseCase(repository as any);
  });

  it("should update an availability rule successfully", async () => {
    const result = await useCase.execute(
      RULE_ID,
      { startTime: "09:00" },
      TENANT_ID,
    );

    expect(result.startTime).toBe("09:00");
    expect(repository.update).toHaveBeenCalledWith(
      RULE_ID,
      TENANT_ID,
      expect.objectContaining({ startTime: "09:00" }),
    );
  });

  it("should throw NotFoundException when rule not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(RULE_ID, { startTime: "09:00" }, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when rule belongs to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(RULE_ID, { startTime: "09:00" }, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow partial update", async () => {
    await useCase.execute(RULE_ID, { endTime: "14:00" }, TENANT_ID);

    expect(repository.update).toHaveBeenCalledWith(
      RULE_ID,
      TENANT_ID,
      expect.objectContaining({ endTime: "14:00" }),
    );
  });

  it("should throw validation error for invalid time format", async () => {
    await expect(
      useCase.execute(RULE_ID, { startTime: "invalid" }, TENANT_ID),
    ).rejects.toThrow();
  });
});
