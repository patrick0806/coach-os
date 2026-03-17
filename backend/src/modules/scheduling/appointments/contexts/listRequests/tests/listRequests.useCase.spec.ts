import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListAppointmentRequestsUseCase } from "../listRequests.useCase";

const TENANT_ID = "tenant-id-1";

const makeRepository = () => ({
  findAllByTenantId: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
});

describe("ListAppointmentRequestsUseCase", () => {
  let useCase: ListAppointmentRequestsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListAppointmentRequestsUseCase(repository as any);
  });

  it("should return paginated results", async () => {
    const result = await useCase.execute({}, TENANT_ID);

    expect(result.content).toEqual([]);
    expect(result.totalElements).toBe(0);
  });

  it("should pass status filter to repository", async () => {
    await useCase.execute({ status: "pending" }, TENANT_ID);

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({ status: "pending" }),
    );
  });

  it("should return empty list when no requests exist", async () => {
    const result = await useCase.execute({}, TENANT_ID);

    expect(result.content).toEqual([]);
    expect(result.totalPages).toBe(0);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute({}, TENANT_ID);

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.any(Object),
    );
  });
});
