import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListAvailabilityExceptionsUseCase } from "../listExceptions.useCase";

const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeException = (overrides = {}) => ({
  id: "exception-id",
  tenantId: TENANT_ID,
  exceptionDate: "2026-12-25",
  reason: "Christmas",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([makeException()]),
  findByDateRange: vi.fn().mockResolvedValue([makeException()]),
});

describe("ListAvailabilityExceptionsUseCase", () => {
  let useCase: ListAvailabilityExceptionsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListAvailabilityExceptionsUseCase(repository as any);
  });

  it("should return all exceptions when no date filter provided", async () => {
    const result = await useCase.execute({}, TENANT_ID);

    expect(result).toHaveLength(1);
    expect(repository.findByTenantId).toHaveBeenCalledWith(TENANT_ID);
  });

  it("should filter by date range when both dates provided", async () => {
    const result = await useCase.execute(
      { startDate: "2026-12-01", endDate: "2026-12-31" },
      TENANT_ID,
    );

    expect(result).toHaveLength(1);
    expect(repository.findByDateRange).toHaveBeenCalledWith(
      TENANT_ID,
      "2026-12-01",
      "2026-12-31",
    );
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute({}, TENANT_ID);

    expect(repository.findByTenantId).toHaveBeenCalledWith(TENANT_ID);
  });
});
