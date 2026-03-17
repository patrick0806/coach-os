import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException } from "@nestjs/common";

import { CreateAvailabilityRuleUseCase } from "../createRule.useCase";

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
  create: vi.fn().mockResolvedValue(makeRule()),
  findByDayOfWeek: vi.fn().mockResolvedValue([]),
});

describe("CreateAvailabilityRuleUseCase", () => {
  let useCase: CreateAvailabilityRuleUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new CreateAvailabilityRuleUseCase(repository as any);
  });

  it("should create an availability rule successfully", async () => {
    const result = await useCase.execute(
      { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
      TENANT_ID,
    );

    expect(result.id).toBe(RULE_ID);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "12:00",
      }),
    );
  });

  it("should throw validation error when dayOfWeek is out of range", async () => {
    await expect(
      useCase.execute(
        { dayOfWeek: 7, startTime: "08:00", endTime: "12:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw validation error when startTime >= endTime", async () => {
    await expect(
      useCase.execute(
        { dayOfWeek: 1, startTime: "14:00", endTime: "12:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw ConflictException when overlapping rule exists", async () => {
    repository.findByDayOfWeek.mockResolvedValue([
      makeRule({ startTime: "10:00", endTime: "14:00" }),
    ]);

    await expect(
      useCase.execute(
        { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute(
      { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
      TENANT_ID,
    );

    expect(repository.findByDayOfWeek).toHaveBeenCalledWith(TENANT_ID, 1);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT_ID }),
    );
  });
});
