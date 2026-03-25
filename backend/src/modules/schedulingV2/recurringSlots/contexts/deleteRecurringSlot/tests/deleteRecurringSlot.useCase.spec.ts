import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteRecurringSlotUseCase } from "../deleteRecurringSlot.useCase";

const SLOT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeSlot = () => ({
  id: SLOT_ID,
  tenantId: TENANT_ID,
  studentId: null,
  studentProgramId: null,
  type: "block",
  dayOfWeek: 1,
  startTime: "10:00",
  endTime: "11:00",
  effectiveFrom: "2026-04-01",
  effectiveTo: null,
  location: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeSlot()),
  update: vi.fn().mockResolvedValue(makeSlot()),
});

describe("DeleteRecurringSlotUseCase", () => {
  let useCase: DeleteRecurringSlotUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new DeleteRecurringSlotUseCase(repository as any);
  });

  it("should soft-delete a recurring slot by setting effectiveTo and isActive", async () => {
    await useCase.execute(SLOT_ID, TENANT_ID);

    expect(repository.update).toHaveBeenCalledWith(
      SLOT_ID,
      TENANT_ID,
      expect.objectContaining({
        isActive: false,
        effectiveTo: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
  });

  it("should throw NotFoundException when slot not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(SLOT_ID, TENANT_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException when slot belongs to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(SLOT_ID, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should enforce tenant isolation via findById call", async () => {
    await useCase.execute(SLOT_ID, TENANT_ID);

    expect(repository.findById).toHaveBeenCalledWith(SLOT_ID, TENANT_ID);
  });
});
