import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteWorkingHoursUseCase } from "../deleteWorkingHours.useCase";

const WH_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeWorkingHours = (overrides = {}) => ({
  id: WH_ID,
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
  findById: vi.fn().mockResolvedValue(makeWorkingHours()),
  update: vi.fn().mockResolvedValue(
    makeWorkingHours({ effectiveTo: "2026-04-10", isActive: false }),
  ),
});

describe("DeleteWorkingHoursUseCase", () => {
  let useCase: DeleteWorkingHoursUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new DeleteWorkingHoursUseCase(repository as any);
  });

  it("should soft-delete working hours by setting effectiveTo and isActive = false", async () => {
    await useCase.execute(WH_ID, TENANT_ID);

    expect(repository.update).toHaveBeenCalledWith(
      WH_ID,
      TENANT_ID,
      expect.objectContaining({
        effectiveTo: expect.any(String),
        isActive: false,
      }),
    );
  });

  it("should throw NotFoundException when working hours not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(WH_ID, TENANT_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException when working hours belong to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(WH_ID, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute(WH_ID, TENANT_ID);

    expect(repository.findById).toHaveBeenCalledWith(WH_ID, TENANT_ID);
    expect(repository.update).toHaveBeenCalledWith(
      WH_ID,
      TENANT_ID,
      expect.any(Object),
    );
  });
});
