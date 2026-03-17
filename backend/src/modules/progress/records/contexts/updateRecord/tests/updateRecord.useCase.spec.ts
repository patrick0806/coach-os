import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateProgressRecordUseCase } from "../updateRecord.useCase";

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
  findById: vi.fn().mockResolvedValue(makeRecord()),
  update: vi.fn().mockResolvedValue(makeRecord()),
});

describe("UpdateProgressRecordUseCase", () => {
  let useCase: UpdateProgressRecordUseCase;
  let progressRecordsRepository: ReturnType<typeof makeProgressRecordsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    progressRecordsRepository = makeProgressRecordsRepository();
    useCase = new UpdateProgressRecordUseCase(progressRecordsRepository as any);
  });

  it("should update a progress record successfully", async () => {
    progressRecordsRepository.update.mockResolvedValue(makeRecord({ value: "85.00" }));

    const result = await useCase.execute(
      RECORD_ID,
      { value: 85, unit: "kg" },
      tenantId,
    );

    expect(progressRecordsRepository.update).toHaveBeenCalledWith(
      RECORD_ID,
      tenantId,
      expect.objectContaining({ value: "85", unit: "kg" }),
    );
    expect(result.value).toBe("85.00");
  });

  it("should throw NotFoundException when record not found", async () => {
    progressRecordsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { value: 85 }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when record belongs to different tenant", async () => {
    progressRecordsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(RECORD_ID, { value: 85 }, "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow partial update with only some fields", async () => {
    await useCase.execute(RECORD_ID, { metricType: "bodyFat" }, tenantId);

    expect(progressRecordsRepository.update).toHaveBeenCalledWith(
      RECORD_ID,
      tenantId,
      expect.objectContaining({ metricType: "bodyFat" }),
    );
  });

  it("should convert numeric value to string on update", async () => {
    await useCase.execute(RECORD_ID, { value: 15.75 }, tenantId);

    expect(progressRecordsRepository.update).toHaveBeenCalledWith(
      RECORD_ID,
      tenantId,
      expect.objectContaining({ value: "15.75" }),
    );
  });
});
