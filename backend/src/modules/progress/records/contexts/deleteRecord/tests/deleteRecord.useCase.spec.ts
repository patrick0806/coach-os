import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteProgressRecordUseCase } from "../deleteRecord.useCase";

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
  delete: vi.fn().mockResolvedValue(true),
});

describe("DeleteProgressRecordUseCase", () => {
  let useCase: DeleteProgressRecordUseCase;
  let progressRecordsRepository: ReturnType<typeof makeProgressRecordsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    progressRecordsRepository = makeProgressRecordsRepository();
    useCase = new DeleteProgressRecordUseCase(progressRecordsRepository as any);
  });

  it("should delete a progress record successfully", async () => {
    await expect(useCase.execute(RECORD_ID, tenantId)).resolves.toBeUndefined();

    expect(progressRecordsRepository.delete).toHaveBeenCalledWith(RECORD_ID, tenantId);
  });

  it("should throw NotFoundException when record not found", async () => {
    progressRecordsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when record belongs to different tenant", async () => {
    progressRecordsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(RECORD_ID, "other-tenant-id")).rejects.toThrow(NotFoundException);
  });

  it("should not call delete when record not found", async () => {
    progressRecordsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow();

    expect(progressRecordsRepository.delete).not.toHaveBeenCalled();
  });
});
