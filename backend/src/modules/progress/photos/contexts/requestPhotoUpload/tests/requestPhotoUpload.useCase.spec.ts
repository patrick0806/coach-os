import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { RequestPhotoUploadUseCase } from "../requestPhotoUpload.useCase";

const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

const makeS3Provider = () => ({
  generatePresignedPutUrl: vi.fn().mockResolvedValue({
    uploadUrl: "https://s3.amazonaws.com/bucket/progress-photos/tenant/student/123.jpg?presigned",
    publicUrl: `https://bucket.s3.us-east-1.amazonaws.com/progress-photos/${TENANT_ID}/${STUDENT_ID}/123.jpg`,
  }),
});

describe("RequestPhotoUploadUseCase", () => {
  let useCase: RequestPhotoUploadUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = TENANT_ID;
  const validBody = { mimeType: "image/jpeg" };

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    s3Provider = makeS3Provider();
    useCase = new RequestPhotoUploadUseCase(studentsRepository as any, s3Provider as any);
  });

  it("should return uploadUrl and fileUrl", async () => {
    const result = await useCase.execute(STUDENT_ID, validBody, tenantId);

    expect(result.uploadUrl).toContain("presigned");
    expect(result.fileUrl).toContain(`progress-photos/${TENANT_ID}/${STUDENT_ID}`);
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when student belongs to different tenant", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(STUDENT_ID, validBody, "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when mimeType is invalid", async () => {
    await expect(
      useCase.execute(STUDENT_ID, { mimeType: "application/pdf" }, tenantId),
    ).rejects.toThrow();
  });

  it("should generate S3 key with correct format: progress-photos/{tenantId}/{studentId}/{timestamp}.{ext}", async () => {
    await useCase.execute(STUDENT_ID, { mimeType: "image/png" }, tenantId);

    expect(s3Provider.generatePresignedPutUrl).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(`^progress-photos/${TENANT_ID}/${STUDENT_ID}/\\d+\\.png$`),
      ),
      "image/png",
    );
  });

  it("should support webp mime type", async () => {
    await useCase.execute(STUDENT_ID, { mimeType: "image/webp" }, tenantId);

    expect(s3Provider.generatePresignedPutUrl).toHaveBeenCalledWith(
      expect.stringMatching(/\.webp$/),
      "image/webp",
    );
  });
});
