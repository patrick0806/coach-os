import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteAvailabilityExceptionUseCase } from "../deleteException.useCase";

const EXCEPTION_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeException = (overrides = {}) => ({
  id: EXCEPTION_ID,
  tenantId: TENANT_ID,
  exceptionDate: "2026-12-25",
  reason: "Christmas",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeException()),
  delete: vi.fn().mockResolvedValue(true),
});

describe("DeleteAvailabilityExceptionUseCase", () => {
  let useCase: DeleteAvailabilityExceptionUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new DeleteAvailabilityExceptionUseCase(repository as any);
  });

  it("should delete an availability exception successfully", async () => {
    await useCase.execute(EXCEPTION_ID, TENANT_ID);

    expect(repository.delete).toHaveBeenCalledWith(EXCEPTION_ID, TENANT_ID);
  });

  it("should throw NotFoundException when exception not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(EXCEPTION_ID, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when exception belongs to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(EXCEPTION_ID, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });
});
