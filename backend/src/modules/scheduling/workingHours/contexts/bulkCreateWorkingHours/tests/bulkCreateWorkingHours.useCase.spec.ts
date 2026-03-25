import { describe, it, expect, beforeEach, vi } from "vitest";

import { BulkCreateWorkingHoursUseCase } from "../bulkCreateWorkingHours.useCase";

const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

let idCounter = 0;
const makeWorkingHours = (overrides = {}) => ({
  id: `wh-${++idCounter}`,
  tenantId: TENANT_ID,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "09:00",
  effectiveFrom: "2026-04-01",
  effectiveTo: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  createMany: vi.fn().mockImplementation((items: any[]) =>
    Promise.resolve(items.map((item: any) => makeWorkingHours(item))),
  ),
  findActiveByTenant: vi.fn().mockResolvedValue([]),
});

describe("BulkCreateWorkingHoursUseCase", () => {
  let useCase: BulkCreateWorkingHoursUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    idCounter = 0;
    repository = makeRepository();
    useCase = new BulkCreateWorkingHoursUseCase(repository as any);
  });

  it("should create multiple working hours successfully", async () => {
    const result = await useCase.execute(
      {
        items: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "09:00", effectiveFrom: "2026-04-01" },
          { dayOfWeek: 1, startTime: "09:00", endTime: "10:00", effectiveFrom: "2026-04-01" },
          { dayOfWeek: 2, startTime: "08:00", endTime: "09:00", effectiveFrom: "2026-04-01" },
        ],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
    expect(repository.createMany).toHaveBeenCalledOnce();
  });

  it("should skip items that overlap with existing working hours", async () => {
    repository.findActiveByTenant.mockResolvedValue([
      makeWorkingHours({ dayOfWeek: 1, startTime: "08:00", endTime: "09:00" }),
    ]);

    const result = await useCase.execute(
      {
        items: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "09:00", effectiveFrom: "2026-04-01" },
          { dayOfWeek: 2, startTime: "08:00", endTime: "09:00", effectiveFrom: "2026-04-01" },
        ],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].index).toBe(0);
    expect(result.errors[0].message).toContain("Overlaps");
  });

  it("should skip items that overlap with each other in the same batch", async () => {
    const result = await useCase.execute(
      {
        items: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "10:00", effectiveFrom: "2026-04-01" },
          { dayOfWeek: 1, startTime: "09:00", endTime: "11:00", effectiveFrom: "2026-04-01" },
        ],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].index).toBe(1);
  });

  it("should throw validation error for empty items array", async () => {
    await expect(
      useCase.execute({ items: [] }, TENANT_ID),
    ).rejects.toThrow();
  });

  it("should throw validation error for invalid item data", async () => {
    await expect(
      useCase.execute(
        {
          items: [
            { dayOfWeek: 7, startTime: "08:00", endTime: "09:00", effectiveFrom: "2026-04-01" },
          ],
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw validation error when startTime >= endTime", async () => {
    await expect(
      useCase.execute(
        {
          items: [
            { dayOfWeek: 1, startTime: "10:00", endTime: "08:00", effectiveFrom: "2026-04-01" },
          ],
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should not call createMany when all items conflict", async () => {
    repository.findActiveByTenant.mockResolvedValue([
      makeWorkingHours({ dayOfWeek: 1, startTime: "08:00", endTime: "12:00" }),
    ]);

    const result = await useCase.execute(
      {
        items: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "10:00", effectiveFrom: "2026-04-01" },
        ],
      },
      TENANT_ID,
    );

    expect(result.created).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(repository.createMany).not.toHaveBeenCalled();
  });

  it("should enforce tenant isolation", async () => {
    await useCase.execute(
      {
        items: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "09:00", effectiveFrom: "2026-04-01" },
        ],
      },
      TENANT_ID,
    );

    expect(repository.findActiveByTenant).toHaveBeenCalledWith(TENANT_ID);
    expect(repository.createMany).toHaveBeenCalledWith([
      expect.objectContaining({ tenantId: TENANT_ID }),
    ]);
  });
});
