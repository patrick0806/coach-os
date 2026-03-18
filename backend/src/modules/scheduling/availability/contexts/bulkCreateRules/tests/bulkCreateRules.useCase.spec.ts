import { describe, it, expect, beforeEach, vi } from "vitest";

import { BulkCreateAvailabilityRulesUseCase } from "../bulkCreateRules.useCase";

const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeRule = (overrides = {}) => ({
  id: "rule-id",
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
  findByDayOfWeek: vi.fn().mockResolvedValue([]),
  createMany: vi.fn().mockResolvedValue([]),
});

describe("BulkCreateAvailabilityRulesUseCase", () => {
  let useCase: BulkCreateAvailabilityRulesUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new BulkCreateAvailabilityRulesUseCase(repository as any);
  });

  it("should create all rules when there are no conflicts", async () => {
    const createdRules = [
      makeRule({ id: "rule-1", dayOfWeek: 1, startTime: "08:00", endTime: "12:00" }),
      makeRule({ id: "rule-2", dayOfWeek: 2, startTime: "08:00", endTime: "12:00" }),
    ];
    repository.createMany.mockResolvedValue(createdRules);

    const result = await useCase.execute(
      {
        rules: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
          { dayOfWeek: 2, startTime: "08:00", endTime: "12:00" },
        ],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(2);
    expect(result.conflicts).toBe(0);
    expect(repository.createMany).toHaveBeenCalledOnce();
  });

  it("should skip rules that conflict with existing DB rules", async () => {
    repository.findByDayOfWeek.mockResolvedValue([
      makeRule({ startTime: "10:00", endTime: "14:00" }),
    ]);
    repository.createMany.mockResolvedValue([]);

    const result = await useCase.execute(
      {
        rules: [{ dayOfWeek: 1, startTime: "08:00", endTime: "12:00" }],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(0);
    expect(result.conflicts).toBe(1);
    expect(repository.createMany).toHaveBeenCalledWith([]);
  });

  it("should skip rules that conflict with other rules in the same batch", async () => {
    const created = [makeRule({ id: "rule-1", startTime: "08:00", endTime: "12:00" })];
    repository.createMany.mockResolvedValue(created);

    const result = await useCase.execute(
      {
        rules: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
          { dayOfWeek: 1, startTime: "10:00", endTime: "14:00" }, // overlaps with first
        ],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(1);
    expect(result.conflicts).toBe(1);
  });

  it("should handle partial success — create valid rules, skip conflicting ones", async () => {
    repository.findByDayOfWeek.mockImplementation(async (_tenantId: string, day: number) => {
      // Day 1 already has a rule from 10:00 to 14:00
      if (day === 1) return [makeRule({ startTime: "10:00", endTime: "14:00" })];
      return [];
    });

    const created = [makeRule({ id: "rule-2", dayOfWeek: 2, startTime: "08:00", endTime: "12:00" })];
    repository.createMany.mockResolvedValue(created);

    const result = await useCase.execute(
      {
        rules: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" }, // conflict
          { dayOfWeek: 2, startTime: "08:00", endTime: "12:00" }, // ok
        ],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(1);
    expect(result.conflicts).toBe(1);
    expect(repository.createMany).toHaveBeenCalledWith([
      expect.objectContaining({ tenantId: TENANT_ID, dayOfWeek: 2 }),
    ]);
  });

  it("should return empty created array when all rules are conflicts", async () => {
    repository.findByDayOfWeek.mockResolvedValue([
      makeRule({ startTime: "06:00", endTime: "22:00" }),
    ]);
    repository.createMany.mockResolvedValue([]);

    const result = await useCase.execute(
      {
        rules: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "10:00" },
          { dayOfWeek: 1, startTime: "14:00", endTime: "16:00" },
        ],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(0);
    expect(result.conflicts).toBe(2);
  });

  it("should query each unique day only once", async () => {
    repository.createMany.mockResolvedValue([]);

    await useCase.execute(
      {
        rules: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "09:00" },
          { dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
          { dayOfWeek: 2, startTime: "08:00", endTime: "09:00" },
        ],
      },
      TENANT_ID,
    );

    // Day 1 and day 2 only — 2 calls total, not 3
    expect(repository.findByDayOfWeek).toHaveBeenCalledTimes(2);
    expect(repository.findByDayOfWeek).toHaveBeenCalledWith(TENANT_ID, 1);
    expect(repository.findByDayOfWeek).toHaveBeenCalledWith(TENANT_ID, 2);
  });

  it("should pass tenantId to createMany for all rules", async () => {
    repository.createMany.mockResolvedValue([makeRule()]);

    await useCase.execute(
      {
        rules: [{ dayOfWeek: 1, startTime: "08:00", endTime: "12:00" }],
      },
      TENANT_ID,
    );

    expect(repository.createMany).toHaveBeenCalledWith([
      expect.objectContaining({ tenantId: TENANT_ID }),
    ]);
  });

  it("should throw validation error when rules array is empty", async () => {
    await expect(
      useCase.execute({ rules: [] }, TENANT_ID),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw validation error when a rule has invalid dayOfWeek", async () => {
    await expect(
      useCase.execute(
        { rules: [{ dayOfWeek: 7, startTime: "08:00", endTime: "12:00" }] },
        TENANT_ID,
      ),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });

  it("should throw validation error when startTime >= endTime", async () => {
    await expect(
      useCase.execute(
        { rules: [{ dayOfWeek: 1, startTime: "14:00", endTime: "08:00" }] },
        TENANT_ID,
      ),
    ).rejects.toMatchObject({ name: "ValidationException" });
  });
});
