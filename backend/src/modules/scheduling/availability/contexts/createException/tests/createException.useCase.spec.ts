import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { CreateAvailabilityExceptionUseCase } from "../createException.useCase";

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
  create: vi.fn().mockResolvedValue(makeException()),
});

describe("CreateAvailabilityExceptionUseCase", () => {
  let useCase: CreateAvailabilityExceptionUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new CreateAvailabilityExceptionUseCase(repository as any);
  });

  it("should create an availability exception successfully", async () => {
    const result = await useCase.execute(
      { exceptionDate: "2026-12-25", reason: "Christmas" },
      TENANT_ID,
    );

    expect(result.id).toBe(EXCEPTION_ID);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        exceptionDate: "2026-12-25",
        reason: "Christmas",
      }),
    );
  });

  it("should throw validation error for invalid date format", async () => {
    await expect(
      useCase.execute({ exceptionDate: "25/12/2026" }, TENANT_ID),
    ).rejects.toThrow();
  });

  it("should throw BadRequestException for past date", async () => {
    await expect(
      useCase.execute({ exceptionDate: "2020-01-01" }, TENANT_ID),
    ).rejects.toThrow(BadRequestException);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute(
      { exceptionDate: "2026-12-25" },
      TENANT_ID,
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT_ID }),
    );
  });
});
