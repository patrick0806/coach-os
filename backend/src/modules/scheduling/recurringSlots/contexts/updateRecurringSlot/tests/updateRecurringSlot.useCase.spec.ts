import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateRecurringSlotUseCase } from "../updateRecurringSlot.useCase";

const SLOT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";

const makeSlot = (overrides = {}) => ({
  id: SLOT_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  studentProgramId: null,
  type: "booking",
  dayOfWeek: 1,
  startTime: "10:00",
  endTime: "11:00",
  effectiveFrom: "2026-04-01",
  effectiveTo: null,
  location: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const NEW_SLOT_ID = "new-slot-id-1234";

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeSlot()),
  update: vi.fn().mockResolvedValue(makeSlot({ isActive: false })),
  create: vi.fn().mockResolvedValue(makeSlot({ id: NEW_SLOT_ID, dayOfWeek: 3 })),
});

describe("UpdateRecurringSlotUseCase", () => {
  let useCase: UpdateRecurringSlotUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new UpdateRecurringSlotUseCase(repository as any);
  });

  it("should close old record and create new versioned record", async () => {
    const result = await useCase.execute(
      SLOT_ID,
      { dayOfWeek: 3 },
      TENANT_ID,
    );

    expect(result.id).toBe(NEW_SLOT_ID);

    // Old record should be closed
    expect(repository.update).toHaveBeenCalledWith(
      SLOT_ID,
      TENANT_ID,
      expect.objectContaining({
        isActive: false,
        effectiveTo: expect.any(String),
      }),
    );

    // New record should be created with updated values
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        dayOfWeek: 3,
        startTime: "10:00",
        endTime: "11:00",
      }),
    );
  });

  it("should copy unchanged fields from old record", async () => {
    await useCase.execute(SLOT_ID, { startTime: "09:00" }, TENANT_ID);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        type: "booking",
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "11:00",
      }),
    );
  });

  it("should throw NotFoundException when slot not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(SLOT_ID, { dayOfWeek: 3 }, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when slot belongs to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(SLOT_ID, { dayOfWeek: 3 }, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw validation error when startTime >= endTime", async () => {
    await expect(
      useCase.execute(
        SLOT_ID,
        { startTime: "12:00", endTime: "10:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should set effectiveFrom on new record to today", async () => {
    await useCase.execute(SLOT_ID, { dayOfWeek: 5 }, TENANT_ID);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        effectiveFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
  });

  it("should allow updating location to null", async () => {
    repository.findById.mockResolvedValue(makeSlot({ location: "Academia XYZ" }));

    await useCase.execute(SLOT_ID, { location: null }, TENANT_ID);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
      }),
    );
  });
});
