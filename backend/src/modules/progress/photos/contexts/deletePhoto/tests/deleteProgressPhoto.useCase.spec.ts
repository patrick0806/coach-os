import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteProgressPhotoUseCase } from "../deleteProgressPhoto.useCase";

const PHOTO_ID = "d4e5f6a7-b8c9-0123-defa-234567890123";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";
const MEDIA_URL = `https://bucket.s3.us-east-1.amazonaws.com/progress-photos/${TENANT_ID}/${STUDENT_ID}/123.jpg`;

const makePhoto = (overrides = {}) => ({
  id: PHOTO_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  mediaUrl: MEDIA_URL,
  notes: null,
  createdAt: new Date(),
  ...overrides,
});

const makeProgressPhotosRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePhoto()),
  delete: vi.fn().mockResolvedValue(true),
});

const makeS3Provider = () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteProgressPhotoUseCase", () => {
  let useCase: DeleteProgressPhotoUseCase;
  let progressPhotosRepository: ReturnType<typeof makeProgressPhotosRepository>;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    progressPhotosRepository = makeProgressPhotosRepository();
    s3Provider = makeS3Provider();
    useCase = new DeleteProgressPhotoUseCase(progressPhotosRepository as any, s3Provider as any);
  });

  it("should delete a progress photo successfully", async () => {
    await expect(useCase.execute(PHOTO_ID, tenantId)).resolves.toBeUndefined();

    expect(progressPhotosRepository.delete).toHaveBeenCalledWith(PHOTO_ID, tenantId);
    expect(s3Provider.deleteObject).toHaveBeenCalledWith(MEDIA_URL);
  });

  it("should not fail when S3 cleanup fails", async () => {
    s3Provider.deleteObject.mockRejectedValue(new Error("S3 error"));

    await expect(useCase.execute(PHOTO_ID, tenantId)).resolves.toBeUndefined();
    expect(progressPhotosRepository.delete).toHaveBeenCalledWith(PHOTO_ID, tenantId);
  });

  it("should throw NotFoundException when photo not found", async () => {
    progressPhotosRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when photo belongs to different tenant", async () => {
    progressPhotosRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(PHOTO_ID, "other-tenant-id")).rejects.toThrow(NotFoundException);
  });

  it("should not call delete when photo not found", async () => {
    progressPhotosRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow();

    expect(progressPhotosRepository.delete).not.toHaveBeenCalled();
  });
});
