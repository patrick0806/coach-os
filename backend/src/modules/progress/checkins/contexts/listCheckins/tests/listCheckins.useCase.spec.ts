import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ListCheckinsUseCase } from "../listCheckins.useCase";

const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeCheckin = (overrides = {}) => ({
  id: "checkin-1",
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  checkinDate: "2026-01-15",
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  records: [],
  photos: [],
  ...overrides,
});

const makeCheckinsRepository = () => ({
  findAllByStudentId: vi.fn().mockResolvedValue({
    rows: [makeCheckin()],
    total: 1,
  }),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

describe("ListCheckinsUseCase", () => {
  let useCase: ListCheckinsUseCase;
  let checkinsRepository: ReturnType<typeof makeCheckinsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  beforeEach(() => {
    checkinsRepository = makeCheckinsRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new ListCheckinsUseCase(
      checkinsRepository as any,
      studentsRepository as any,
    );
  });

  it("should return paginated checkins", async () => {
    const result = await useCase.execute(STUDENT_ID, TENANT_ID, { page: 0, size: 10 });

    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
  });

  it("should return empty list when no checkins", async () => {
    checkinsRepository.findAllByStudentId.mockResolvedValue({ rows: [], total: 0 });

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, { page: 0, size: 10 });

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", TENANT_ID, { page: 0, size: 10 }),
    ).rejects.toThrow(NotFoundException);
  });

  it("should use custom pagination params", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID, { page: 2, size: 5 });

    expect(checkinsRepository.findAllByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      { page: 2, size: 5 },
    );
  });

  it("should calculate totalPages correctly", async () => {
    checkinsRepository.findAllByStudentId.mockResolvedValue({ rows: [], total: 25 });

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, { page: 0, size: 10 });

    expect(result.totalPages).toBe(3);
  });
});
