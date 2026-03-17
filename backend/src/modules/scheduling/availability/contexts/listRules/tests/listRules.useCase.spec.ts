import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListAvailabilityRulesUseCase } from "../listRules.useCase";

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
  findByTenantId: vi.fn().mockResolvedValue([makeRule(), makeRule({ id: "rule-2", dayOfWeek: 3 })]),
});

describe("ListAvailabilityRulesUseCase", () => {
  let useCase: ListAvailabilityRulesUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListAvailabilityRulesUseCase(repository as any);
  });

  it("should return availability rules", async () => {
    const result = await useCase.execute(TENANT_ID);

    expect(result).toHaveLength(2);
    expect(repository.findByTenantId).toHaveBeenCalledWith(TENANT_ID);
  });

  it("should return empty array when no rules exist", async () => {
    repository.findByTenantId.mockResolvedValue([]);

    const result = await useCase.execute(TENANT_ID);

    expect(result).toEqual([]);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute(TENANT_ID);

    expect(repository.findByTenantId).toHaveBeenCalledWith(TENANT_ID);
  });
});
