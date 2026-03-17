import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ListProgressRecordsUseCase } from "../listRecords.useCase";

const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeRecord = (overrides = {}) => ({
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  metricType: "weight",
  value: "80.50",
  unit: "kg",
  recordedAt: new Date("2026-01-01"),
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeProgressRecordsRepository = () => ({
  findAllByStudentId: vi.fn().mockResolvedValue({ rows: [makeRecord()], total: 1 }),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

describe("ListProgressRecordsUseCase", () => {
  let useCase: ListProgressRecordsUseCase;
  let progressRecordsRepository: ReturnType<typeof makeProgressRecordsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    progressRecordsRepository = makeProgressRecordsRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new ListProgressRecordsUseCase(
      progressRecordsRepository as any,
      studentsRepository as any,
    );
  });

  it("should return paginated progress records", async () => {
    const result = await useCase.execute(STUDENT_ID, {}, tenantId);

    expect(result.content).toHaveLength(1);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should filter by metricType when provided", async () => {
    await useCase.execute(STUDENT_ID, { metricType: "weight" }, tenantId);

    expect(progressRecordsRepository.findAllByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      tenantId,
      expect.objectContaining({ metricType: "weight" }),
    );
  });

  it("should return empty page when no records exist", async () => {
    progressRecordsRepository.findAllByStudentId.mockResolvedValue({ rows: [], total: 0 });

    const result = await useCase.execute(STUDENT_ID, {}, tenantId);

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", {}, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should use default pagination values when not provided", async () => {
    await useCase.execute(STUDENT_ID, {}, tenantId);

    expect(progressRecordsRepository.findAllByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      tenantId,
      expect.objectContaining({ page: 0, size: 10 }),
    );
  });

  it("should respect custom pagination", async () => {
    progressRecordsRepository.findAllByStudentId.mockResolvedValue({ rows: [], total: 25 });

    const result = await useCase.execute(STUDENT_ID, { page: 2, size: 5 }, tenantId);

    expect(result.page).toBe(2);
    expect(result.size).toBe(5);
    expect(result.totalPages).toBe(5);
  });
});
