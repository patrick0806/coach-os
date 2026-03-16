import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

import { DeleteExerciseUseCase } from "../deleteExercise.useCase";

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
  delete: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteExerciseUseCase", () => {
  let useCase: DeleteExerciseUseCase;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    exercisesRepository = makeExercisesRepository();
    useCase = new DeleteExerciseUseCase(exercisesRepository as any);
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
});
