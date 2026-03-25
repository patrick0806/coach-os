import { describe, it, expect, beforeEach, vi } from "vitest";

import { CreateRecurringSlotUseCase } from "../createRecurringSlot.useCase";

const SLOT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";

const makeSlot = (overrides = {}) => ({
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
  ...overrides,
});

const makeRepository = () => ({
  create: vi.fn().mockResolvedValue(makeSlot()),
});

describe("CreateRecurringSlotUseCase", () => {
  let useCase: CreateRecurringSlotUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new CreateRecurringSlotUseCase(repository as any);
  });

  it("should create a block recurring slot successfully", async () => {
    const result = await useCase.execute(
      {
        type: "block",
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
        effectiveFrom: "2026-04-01",
      },
      TENANT_ID,
    );

    expect(result.id).toBe(SLOT_ID);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        type: "block",
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
        effectiveFrom: "2026-04-01",
      }),
    );
  });

  it("should create a booking recurring slot with studentId", async () => {
    repository.create.mockResolvedValue(
      makeSlot({ type: "booking", studentId: STUDENT_ID }),
    );

    const result = await useCase.execute(
      {
        type: "booking",
        dayOfWeek: 3,
        startTime: "14:00",
        endTime: "15:00",
        effectiveFrom: "2026-04-01",
        studentId: STUDENT_ID,
      },
      TENANT_ID,
    );

    expect(result.studentId).toBe(STUDENT_ID);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        type: "booking",
        studentId: STUDENT_ID,
      }),
    );
  });

  it("should throw validation error when type is booking and studentId is missing", async () => {
    await expect(
      useCase.execute(
        {
          type: "booking",
          dayOfWeek: 1,
          startTime: "10:00",
          endTime: "11:00",
          effectiveFrom: "2026-04-01",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw validation error when startTime >= endTime", async () => {
    await expect(
      useCase.execute(
        {
          type: "block",
          dayOfWeek: 1,
          startTime: "12:00",
          endTime: "10:00",
          effectiveFrom: "2026-04-01",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw validation error when dayOfWeek is out of range", async () => {
    await expect(
      useCase.execute(
        {
          type: "block",
          dayOfWeek: 7,
          startTime: "10:00",
          endTime: "11:00",
          effectiveFrom: "2026-04-01",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw validation error when effectiveFrom has invalid format", async () => {
    await expect(
      useCase.execute(
        {
          type: "block",
          dayOfWeek: 1,
          startTime: "10:00",
          endTime: "11:00",
          effectiveFrom: "04-01-2026",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw validation error when startTime has invalid format", async () => {
    await expect(
      useCase.execute(
        {
          type: "block",
          dayOfWeek: 1,
          startTime: "10:00:00",
          endTime: "11:00",
          effectiveFrom: "2026-04-01",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should create with optional location", async () => {
    repository.create.mockResolvedValue(
      makeSlot({ location: "Academia XYZ" }),
    );

    const result = await useCase.execute(
      {
        type: "block",
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
        effectiveFrom: "2026-04-01",
        location: "Academia XYZ",
      },
      TENANT_ID,
    );

    expect(result.location).toBe("Academia XYZ");
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ location: "Academia XYZ" }),
    );
  });
});
