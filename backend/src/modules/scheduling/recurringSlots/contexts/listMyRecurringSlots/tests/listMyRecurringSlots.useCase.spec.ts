import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListMyRecurringSlotsUseCase } from "../listMyRecurringSlots.useCase";

const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeSlot = (overrides = {}) => ({
  id: "slot-id",
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

const makeRepository = () => ({
  findByStudentId: vi
    .fn()
    .mockResolvedValue([makeSlot(), makeSlot({ id: "s-2", dayOfWeek: 3 })]),
});

describe("ListMyRecurringSlotsUseCase", () => {
  let useCase: ListMyRecurringSlotsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListMyRecurringSlotsUseCase(repository as any);
  });

  it("should return active recurring slots for the student", async () => {
    const result = await useCase.execute(STUDENT_ID, TENANT_ID);

    expect(result).toHaveLength(2);
    expect(repository.findByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      true,
    );
  });

  it("should return empty array when no slots exist", async () => {
    repository.findByStudentId.mockResolvedValue([]);

    const result = await useCase.execute(STUDENT_ID, TENANT_ID);

    expect(result).toEqual([]);
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID);

    expect(repository.findByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      expect.any(Boolean),
    );
  });
});
