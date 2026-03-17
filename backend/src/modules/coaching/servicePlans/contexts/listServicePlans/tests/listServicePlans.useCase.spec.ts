import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListServicePlansUseCase } from "../listServicePlans.useCase";

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
  findByTenantId: vi.fn().mockResolvedValue([makePlan()]),
});

describe("ListServicePlansUseCase", () => {
  let useCase: ListServicePlansUseCase;
  let repository: ReturnType<typeof makeRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListServicePlansUseCase(repository as any);
  });

  it("should return service plans for the tenant", async () => {
    const result = await useCase.execute(tenantId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("plan-id-1");
    expect(repository.findByTenantId).toHaveBeenCalledWith(tenantId);
  });

  it("should return empty array when no plans exist", async () => {
    repository.findByTenantId.mockResolvedValue([]);

    const result = await useCase.execute(tenantId);

    expect(result).toHaveLength(0);
  });

  it("should enforce tenant isolation by passing tenantId to repository", async () => {
    await useCase.execute("other-tenant-id");

    expect(repository.findByTenantId).toHaveBeenCalledWith("other-tenant-id");
  });
});
