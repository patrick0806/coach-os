import { describe, it, expect, beforeEach, vi } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { UpdateExerciseUseCase } from "../updateExercise.useCase";

const makePrivateExercise = (tenantId = "tenant-id-1") => ({
  id: "exercise-id-1",
  name: "Supino Reto",
  muscleGroup: "peitoral",
  description: null,
  instructions: null,
  mediaUrl: null,
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

describe("UpdateExerciseUseCase", () => {
  let useCase: UpdateExerciseUseCase;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;

  const tenantId = "tenant-id-1";
  const validBody = { name: "Supino Inclinado" };

  beforeEach(() => {
    exercisesRepository = makeExercisesRepository();
    useCase = new UpdateExerciseUseCase(exercisesRepository as any);
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
});
