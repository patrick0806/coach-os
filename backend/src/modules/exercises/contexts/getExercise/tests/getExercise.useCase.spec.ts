import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetExerciseUseCase } from "../getExercise.useCase";

const makeExercisesRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "exercise-id-1",
    name: "Supino Reto",
    muscleGroup: "peitoral",
    description: null,
    instructions: null,
    mediaUrl: null,
    youtubeUrl: null,
    tenantId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

describe("GetExerciseUseCase", () => {
  let useCase: GetExerciseUseCase;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    exercisesRepository = makeExercisesRepository();
    useCase = new GetExerciseUseCase(exercisesRepository as any);
  });

  it("should return a global exercise (tenantId = null) for any coach", async () => {
    const result = await useCase.execute("exercise-id-1", tenantId);

    expect(result.id).toBe("exercise-id-1");
    expect(result.tenantId).toBeNull();
  });

  it("should return a private exercise owned by the coach", async () => {
    exercisesRepository.findById.mockResolvedValue({
      id: "exercise-id-2",
      name: "Exercício Privado",
      muscleGroup: "biceps",
      tenantId: "tenant-id-1",
    });

    const result = await useCase.execute("exercise-id-2", tenantId);

    expect(result.id).toBe("exercise-id-2");
    expect(result.tenantId).toBe("tenant-id-1");
  });

  it("should throw NotFoundException when exercise not found", async () => {
    exercisesRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent-id", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException for private exercise from another tenant", async () => {
    exercisesRepository.findById.mockResolvedValue({
      id: "exercise-id-3",
      name: "Exercício de Outro Coach",
      muscleGroup: "costas",
      tenantId: "other-tenant-id",
    });

    await expect(useCase.execute("exercise-id-3", tenantId)).rejects.toThrow(NotFoundException);
  });
});
