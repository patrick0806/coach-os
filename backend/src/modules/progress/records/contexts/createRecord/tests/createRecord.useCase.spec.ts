import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { CreateProgressRecordUseCase } from "../createRecord.useCase";

const RECORD_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeRecord = (overrides = {}) => ({
  id: RECORD_ID,
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
  create: vi.fn().mockResolvedValue(makeRecord()),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

describe("CreateProgressRecordUseCase", () => {
  let useCase: CreateProgressRecordUseCase;
  let progressRecordsRepository: ReturnType<typeof makeProgressRecordsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    progressRecordsRepository = makeProgressRecordsRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new CreateProgressRecordUseCase(
      progressRecordsRepository as any,
      studentsRepository as any,
    );
  });

  it("should create a progress record successfully", async () => {
    const result = await useCase.execute(
      STUDENT_ID,
      {
        metricType: "weight",
        value: 80.5,
        unit: "kg",
        recordedAt: new Date("2026-01-01"),
      },
      tenantId,
    );

    expect(result.id).toBe(RECORD_ID);
    expect(progressRecordsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        studentId: STUDENT_ID,
        metricType: "weight",
        value: "80.5",
        unit: "kg",
      }),
    );
  });

  it("should convert numeric value to string when creating", async () => {
    await useCase.execute(
      STUDENT_ID,
      { metricType: "bodyFat", value: 15.75, unit: "%", recordedAt: new Date() },
      tenantId,
    );

    expect(progressRecordsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ value: "15.75" }),
    );
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        "nonexistent-id",
        { metricType: "weight", value: 80, unit: "kg", recordedAt: new Date() },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should enforce tenant isolation via student lookup", async () => {
    await useCase.execute(
      STUDENT_ID,
      { metricType: "weight", value: 80, unit: "kg", recordedAt: new Date() },
      tenantId,
    );

    expect(studentsRepository.findById).toHaveBeenCalledWith(STUDENT_ID, tenantId);
  });

  it("should throw ValidationException when value is not positive", async () => {
    await expect(
      useCase.execute(
        STUDENT_ID,
        { metricType: "weight", value: -5, unit: "kg", recordedAt: new Date() },
        tenantId,
      ),
    ).rejects.toThrow();
  });

  it("should save notes when provided", async () => {
    progressRecordsRepository.create.mockResolvedValue(makeRecord({ notes: "After morning fast" }));

    const result = await useCase.execute(
      STUDENT_ID,
      {
        metricType: "weight",
        value: 80,
        unit: "kg",
        recordedAt: new Date(),
        notes: "After morning fast",
      },
      tenantId,
    );

    expect(progressRecordsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ notes: "After morning fast" }),
    );
    expect(result.notes).toBe("After morning fast");
  });
});
