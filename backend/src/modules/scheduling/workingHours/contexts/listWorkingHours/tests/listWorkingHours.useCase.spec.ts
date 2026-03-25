import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListWorkingHoursUseCase } from "../listWorkingHours.useCase";

const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeWorkingHours = (overrides = {}) => ({
  id: "wh-id",
  tenantId: TENANT_ID,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
  effectiveFrom: "2026-04-01",
  effectiveTo: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findActiveByTenant: vi.fn().mockResolvedValue([
    makeWorkingHours(),
    makeWorkingHours({ id: "wh-2", dayOfWeek: 3 }),
  ]),
});

describe("ListWorkingHoursUseCase", () => {
  let useCase: ListWorkingHoursUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListWorkingHoursUseCase(repository as any);
  });

  it("should return working hours", async () => {
    const result = await useCase.execute(TENANT_ID);

    expect(result).toHaveLength(2);
    expect(repository.findActiveByTenant).toHaveBeenCalledWith(TENANT_ID);
  });

  it("should return empty array when no working hours exist", async () => {
    repository.findActiveByTenant.mockResolvedValue([]);

    const result = await useCase.execute(TENANT_ID);

    expect(result).toEqual([]);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute(TENANT_ID);

    expect(repository.findActiveByTenant).toHaveBeenCalledWith(TENANT_ID);
  });
});
