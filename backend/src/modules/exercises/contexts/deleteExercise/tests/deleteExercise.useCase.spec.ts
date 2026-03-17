import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

import { DeleteExerciseUseCase } from "../deleteExercise.useCase";

const MEDIA_URL = "https://bucket.s3.region.amazonaws.com/exercises/tenant/ex/file.jpg";

const makePrivateExercise = (tenantId = "tenant-id-1", mediaUrl: string | null = null) => ({
  id: "exercise-id-1",
  name: "Supino Reto",
  muscleGroup: "peitoral",
  mediaUrl,
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeExercisesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePrivateExercise()),
  delete: vi.fn().mockResolvedValue(undefined),
});

const makeS3Provider = () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteExerciseUseCase", () => {
  let useCase: DeleteExerciseUseCase;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    exercisesRepository = makeExercisesRepository();
    s3Provider = makeS3Provider();
    useCase = new DeleteExerciseUseCase(exercisesRepository as any, s3Provider as any);
  });

  it("should delete exercise successfully", async () => {
    await expect(useCase.execute("exercise-id-1", tenantId)).resolves.toBeUndefined();

    expect(exercisesRepository.delete).toHaveBeenCalledWith("exercise-id-1", tenantId);
  });

  it("should throw NotFoundException when exercise not found", async () => {
    exercisesRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw ForbiddenException when deleting a global exercise", async () => {
    exercisesRepository.findById.mockResolvedValue({ ...makePrivateExercise(), tenantId: null });

    await expect(useCase.execute("exercise-id-1", tenantId)).rejects.toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException when deleting exercise from another tenant", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise("other-tenant-id"));

    await expect(useCase.execute("exercise-id-1", tenantId)).rejects.toThrow(ForbiddenException);
  });

  it("should throw ConflictException when exercise is in use (FK constraint)", async () => {
    exercisesRepository.delete.mockRejectedValue(new Error("foreign key constraint"));

    await expect(useCase.execute("exercise-id-1", tenantId)).rejects.toThrow(ConflictException);
  });

  it("should delete S3 object after successful DB deletion when mediaUrl exists", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise(tenantId, MEDIA_URL));

    await useCase.execute("exercise-id-1", tenantId);

    expect(s3Provider.deleteObject).toHaveBeenCalledWith(MEDIA_URL);
  });

  it("should not call deleteObject when exercise has no mediaUrl", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise(tenantId, null));

    await useCase.execute("exercise-id-1", tenantId);

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });

  it("should not delete S3 object when DB deletion fails", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise(tenantId, MEDIA_URL));
    exercisesRepository.delete.mockRejectedValue(new Error("foreign key constraint"));

    await expect(useCase.execute("exercise-id-1", tenantId)).rejects.toThrow(ConflictException);

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });
});
