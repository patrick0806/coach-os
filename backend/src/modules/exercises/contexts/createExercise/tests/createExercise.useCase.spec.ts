import { describe, it, expect, beforeEach, vi } from "vitest";

import { CreateExerciseUseCase } from "../createExercise.useCase";

const makeExercisesRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "exercise-id-1",
    name: "Supino Reto",
    muscleGroup: "peitoral",
    description: null,
    instructions: null,
    mediaUrl: null,
    youtubeUrl: null,
    tenantId: "tenant-id-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

describe("CreateExerciseUseCase", () => {
  let useCase: CreateExerciseUseCase;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;

  const validBody = {
    name: "Supino Reto",
    muscleGroup: "peitoral",
  };

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    exercisesRepository = makeExercisesRepository();
    useCase = new CreateExerciseUseCase(exercisesRepository as any);
  });

  it("should create exercise successfully", async () => {
    const result = await useCase.execute(validBody, tenantId);

    expect(result.id).toBe("exercise-id-1");
    expect(result.name).toBe("Supino Reto");
    expect(result.muscleGroup).toBe("peitoral");
  });

  it("should pass tenantId to repository", async () => {
    await useCase.execute(validBody, tenantId);

    expect(exercisesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId }),
    );
  });

  it("should throw ValidationException when name is missing", async () => {
    await expect(
      useCase.execute({ muscleGroup: "peitoral" }, tenantId),
    ).rejects.toThrow();
  });

  it("should throw ValidationException when muscleGroup is missing", async () => {
    await expect(
      useCase.execute({ name: "Supino Reto" }, tenantId),
    ).rejects.toThrow();
  });

  it("should throw ValidationException when name is too short", async () => {
    await expect(
      useCase.execute({ name: "AB", muscleGroup: "peitoral" }, tenantId),
    ).rejects.toThrow();
  });

  it("should create exercise with optional fields when provided", async () => {
    const bodyWithOptionals = {
      ...validBody,
      description: "Descrição do exercício",
      instructions: "Instruções do exercício",
      youtubeUrl: "https://youtube.com/watch?v=abc123",
    };

    exercisesRepository.create.mockResolvedValue({
      id: "exercise-id-1",
      name: "Supino Reto",
      muscleGroup: "peitoral",
      description: "Descrição do exercício",
      instructions: "Instruções do exercício",
      mediaUrl: null,
      youtubeUrl: "https://youtube.com/watch?v=abc123",
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(bodyWithOptionals, tenantId);

    expect(exercisesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Descrição do exercício",
        instructions: "Instruções do exercício",
        youtubeUrl: "https://youtube.com/watch?v=abc123",
      }),
    );
    expect(result.description).toBe("Descrição do exercício");
  });
});
