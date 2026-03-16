import { describe, it, expect, beforeEach, vi } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { RequestUploadUrlUseCase } from "../requestUploadUrl.useCase";

const makePrivateExercise = (tenantId = "tenant-id-1") => ({
  id: "exercise-id-1",
  name: "Supino Reto",
  muscleGroup: "peitoral",
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeExercisesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePrivateExercise()),
});

const makeS3Provider = () => ({
  generatePresignedPutUrl: vi.fn().mockResolvedValue({
    uploadUrl: "https://s3.amazonaws.com/bucket/exercises/tenant-id-1/exercise-id-1/123456.jpg?presigned",
    publicUrl: "https://bucket.s3.us-east-1.amazonaws.com/exercises/tenant-id-1/exercise-id-1/123456.jpg",
  }),
});

describe("RequestUploadUrlUseCase", () => {
  let useCase: RequestUploadUrlUseCase;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = "tenant-id-1";
  const validBody = { mimeType: "image/jpeg" };

  beforeEach(() => {
    exercisesRepository = makeExercisesRepository();
    s3Provider = makeS3Provider();
    useCase = new RequestUploadUrlUseCase(exercisesRepository as any, s3Provider as any);
  });

  it("should return uploadUrl and fileUrl", async () => {
    const result = await useCase.execute("exercise-id-1", validBody, tenantId);

    expect(result.uploadUrl).toContain("presigned");
    expect(result.fileUrl).toContain("exercises/tenant-id-1/exercise-id-1");
  });

  it("should throw NotFoundException when exercise not found", async () => {
    exercisesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ForbiddenException for global exercise", async () => {
    exercisesRepository.findById.mockResolvedValue({ ...makePrivateExercise(), tenantId: null });

    await expect(
      useCase.execute("exercise-id-1", validBody, tenantId),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException for exercise from another tenant", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise("other-tenant-id"));

    await expect(
      useCase.execute("exercise-id-1", validBody, tenantId),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should throw ValidationException when mimeType is invalid", async () => {
    await expect(
      useCase.execute("exercise-id-1", { mimeType: "application/pdf" }, tenantId),
    ).rejects.toThrow();
  });

  it("should generate S3 key with correct format: exercises/{tenantId}/{exerciseId}/{timestamp}.{ext}", async () => {
    await useCase.execute("exercise-id-1", { mimeType: "image/png" }, tenantId);

    expect(s3Provider.generatePresignedPutUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^exercises\/tenant-id-1\/exercise-id-1\/\d+\.png$/),
      "image/png",
    );
  });
});
