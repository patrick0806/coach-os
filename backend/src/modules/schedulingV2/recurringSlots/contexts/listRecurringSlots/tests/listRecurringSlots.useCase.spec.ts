import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListRecurringSlotsUseCase } from "../listRecurringSlots.useCase";

const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";

const makeSlot = (overrides = {}) => ({
  id: "slot-id",
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
  findByTenantId: vi
    .fn()
    .mockResolvedValue([makeSlot(), makeSlot({ id: "s-2", dayOfWeek: 3 })]),
  findByStudentId: vi
    .fn()
    .mockResolvedValue([makeSlot({ studentId: STUDENT_ID })]),
});

describe("ListRecurringSlotsUseCase", () => {
  let useCase: ListRecurringSlotsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListRecurringSlotsUseCase(repository as any);
  });

  it("should return all recurring slots for tenant when no studentId provided", async () => {
    const result = await useCase.execute(TENANT_ID);

    expect(result).toHaveLength(2);
    expect(repository.findByTenantId).toHaveBeenCalledWith(TENANT_ID, true);
  });

  it("should return recurring slots for specific student when studentId provided", async () => {
    const result = await useCase.execute(TENANT_ID, STUDENT_ID);

    expect(result).toHaveLength(1);
    expect(repository.findByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      true,
    );
  });

  it("should return empty array when no slots exist", async () => {
    repository.findByTenantId.mockResolvedValue([]);

    const result = await useCase.execute(TENANT_ID);

    expect(result).toEqual([]);
  });

  it("should not call findByStudentId when no studentId provided", async () => {
    await useCase.execute(TENANT_ID);

    expect(repository.findByStudentId).not.toHaveBeenCalled();
  });

  it("should not call findByTenantId when studentId is provided", async () => {
    await useCase.execute(TENANT_ID, STUDENT_ID);

    expect(repository.findByTenantId).not.toHaveBeenCalled();
  });
});
