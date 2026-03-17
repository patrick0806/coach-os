import { describe, it, expect, beforeEach, vi } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { UpdateExerciseUseCase } from "../updateExercise.useCase";

const MEDIA_URL = "https://bucket.s3.region.amazonaws.com/exercises/tenant/ex/file.jpg";

const makePrivateExercise = (tenantId = "tenant-id-1", mediaUrl: string | null = null) => ({
  id: "exercise-id-1",
  name: "Supino Reto",
  muscleGroup: "peitoral",
  description: null,
  instructions: null,
  mediaUrl,
  youtubeUrl: null,
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeGlobalExercise = () => ({
  ...makePrivateExercise(),
  tenantId: null,
});

const makeExercisesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makePrivateExercise()),
  update: vi.fn().mockResolvedValue({
    ...makePrivateExercise(),
    name: "Supino Inclinado",
  }),
});

const makeS3Provider = () => ({
  deleteObject: vi.fn().mockResolvedValue(undefined),
});

describe("UpdateExerciseUseCase", () => {
  let useCase: UpdateExerciseUseCase;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;
  let s3Provider: ReturnType<typeof makeS3Provider>;

  const tenantId = "tenant-id-1";
  const validBody = { name: "Supino Inclinado" };

  beforeEach(() => {
    exercisesRepository = makeExercisesRepository();
    s3Provider = makeS3Provider();
    useCase = new UpdateExerciseUseCase(exercisesRepository as any, s3Provider as any);
  });

  it("should update exercise successfully", async () => {
    const result = await useCase.execute("exercise-id-1", validBody, tenantId);

    expect(result.name).toBe("Supino Inclinado");
    expect(exercisesRepository.update).toHaveBeenCalledWith(
      "exercise-id-1",
      tenantId,
      expect.objectContaining({ name: "Supino Inclinado" }),
    );
  });

  it("should throw NotFoundException when exercise not found", async () => {
    exercisesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ForbiddenException when updating a global exercise", async () => {
    exercisesRepository.findById.mockResolvedValue(makeGlobalExercise());

    await expect(
      useCase.execute("exercise-id-1", validBody, tenantId),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException when updating exercise from another tenant", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise("other-tenant-id"));

    await expect(
      useCase.execute("exercise-id-1", validBody, tenantId),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should support partial update with only some fields", async () => {
    await useCase.execute("exercise-id-1", { muscleGroup: "triceps" }, tenantId);

    expect(exercisesRepository.update).toHaveBeenCalledWith(
      "exercise-id-1",
      tenantId,
      expect.objectContaining({ muscleGroup: "triceps" }),
    );
  });

  it("should throw ValidationException on invalid input", async () => {
    await expect(
      useCase.execute("exercise-id-1", { name: "AB" }, tenantId),
    ).rejects.toThrow();
  });

  it("should delete old S3 object when mediaUrl is set to null", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise(tenantId, MEDIA_URL));
    exercisesRepository.update.mockResolvedValue({ ...makePrivateExercise(), mediaUrl: null });

    await useCase.execute("exercise-id-1", { mediaUrl: null }, tenantId);

    expect(s3Provider.deleteObject).toHaveBeenCalledWith(MEDIA_URL);
  });

  it("should delete old S3 object when mediaUrl is replaced with a new one", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise(tenantId, MEDIA_URL));
    const newUrl = "https://bucket.s3.region.amazonaws.com/exercises/tenant/ex/new.jpg";
    exercisesRepository.update.mockResolvedValue({ ...makePrivateExercise(), mediaUrl: newUrl });

    await useCase.execute("exercise-id-1", { mediaUrl: newUrl }, tenantId);

    expect(s3Provider.deleteObject).toHaveBeenCalledWith(MEDIA_URL);
  });

  it("should not call deleteObject when mediaUrl is not part of the update", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise(tenantId, MEDIA_URL));

    await useCase.execute("exercise-id-1", { name: "Outro nome" }, tenantId);

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });

  it("should not call deleteObject when exercise has no mediaUrl", async () => {
    exercisesRepository.findById.mockResolvedValue(makePrivateExercise(tenantId, null));

    await useCase.execute("exercise-id-1", { mediaUrl: null }, tenantId);

    expect(s3Provider.deleteObject).not.toHaveBeenCalled();
  });
});
