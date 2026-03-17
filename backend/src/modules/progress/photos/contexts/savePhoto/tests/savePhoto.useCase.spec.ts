import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { SaveProgressPhotoUseCase } from "../savePhoto.useCase";

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
  create: vi.fn().mockResolvedValue(makePhoto()),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

describe("SaveProgressPhotoUseCase", () => {
  let useCase: SaveProgressPhotoUseCase;
  let progressPhotosRepository: ReturnType<typeof makeProgressPhotosRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    progressPhotosRepository = makeProgressPhotosRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new SaveProgressPhotoUseCase(
      progressPhotosRepository as any,
      studentsRepository as any,
    );
  });

  it("should save a progress photo successfully", async () => {
    const result = await useCase.execute(
      STUDENT_ID,
      { mediaUrl: MEDIA_URL },
      tenantId,
    );

    expect(result.id).toBe(PHOTO_ID);
    expect(progressPhotosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        studentId: STUDENT_ID,
        mediaUrl: MEDIA_URL,
      }),
    );
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { mediaUrl: MEDIA_URL }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when student belongs to different tenant", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(STUDENT_ID, { mediaUrl: MEDIA_URL }, "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when mediaUrl is not a valid URL", async () => {
    await expect(
      useCase.execute(STUDENT_ID, { mediaUrl: "not-a-url" }, tenantId),
    ).rejects.toThrow();
  });

  it("should save notes when provided", async () => {
    progressPhotosRepository.create.mockResolvedValue(makePhoto({ notes: "Front view" }));

    const result = await useCase.execute(
      STUDENT_ID,
      { mediaUrl: MEDIA_URL, notes: "Front view" },
      tenantId,
    );

    expect(progressPhotosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ notes: "Front view" }),
    );
    expect(result.notes).toBe("Front view");
  });
});
