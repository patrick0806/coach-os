import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { AddExerciseTemplateUseCase } from "../addExerciseTemplate.useCase";

const makeWorkoutWithTenant = (tenantId = "tenant-id-1") => ({
  id: "workout-id-1",
  programTemplateId: "template-id-1",
  name: "Treino A",
  order: 1,
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeExercise = (tenantId: string | null = null) => ({
  id: "exercise-id-1",
  name: "Supino Reto",
  muscleGroup: "peitoral",
  tenantId,
  description: null,
  instructions: null,
  mediaUrl: null,
  youtubeUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutTemplatesRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeWorkoutWithTenant()),
});

const makeExerciseTemplatesRepository = () => ({
  findMaxOrderByWorkoutTemplateId: vi.fn().mockResolvedValue(1),
  create: vi.fn().mockResolvedValue({
    id: "exercise-template-id-1",
    workoutTemplateId: "workout-id-1",
    exerciseId: "exercise-id-1",
    sets: 3,
    repetitions: 10,
    restSeconds: 60,
    duration: null,
    order: 2,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

const makeExercisesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeExercise()),
});

describe("AddExerciseTemplateUseCase", () => {
  let useCase: AddExerciseTemplateUseCase;
  let workoutTemplatesRepository: ReturnType<typeof makeWorkoutTemplatesRepository>;
  let exerciseTemplatesRepository: ReturnType<typeof makeExerciseTemplatesRepository>;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;

  const tenantId = "tenant-id-1";

  const validBody = {
    exerciseId: "exercise-id-1",
    sets: 3,
    repetitions: 10,
    restSeconds: 60,
  };

  beforeEach(() => {
    workoutTemplatesRepository = makeWorkoutTemplatesRepository();
    exerciseTemplatesRepository = makeExerciseTemplatesRepository();
    exercisesRepository = makeExercisesRepository();
    useCase = new AddExerciseTemplateUseCase(
      workoutTemplatesRepository as any,
      exerciseTemplatesRepository as any,
      exercisesRepository as any,
    );
  });

  it("should add exercise template successfully", async () => {
    const result = await useCase.execute("workout-id-1", validBody, tenantId);

    expect(result.exerciseId).toBe("exercise-id-1");
    expect(result.sets).toBe(3);
    expect(result.order).toBe(2);
  });

  it("should set order to 0 when no exercises exist", async () => {
    exerciseTemplatesRepository.findMaxOrderByWorkoutTemplateId.mockResolvedValue(-1);

    await useCase.execute("workout-id-1", validBody, tenantId);

    expect(exerciseTemplatesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ order: 0 }),
    );
  });

  it("should throw NotFoundException when exercise not found", async () => {
    exercisesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("workout-id-1", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when exercise belongs to different tenant", async () => {
    exercisesRepository.findById.mockResolvedValue(makeExercise("other-tenant-id"));

    await expect(
      useCase.execute("workout-id-1", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout belongs to different tenant", async () => {
    workoutTemplatesRepository.findByIdWithTenant.mockResolvedValue(
      makeWorkoutWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("workout-id-1", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when sets is missing", async () => {
    await expect(
      useCase.execute("workout-id-1", { exerciseId: "exercise-id-1" }, tenantId),
    ).rejects.toThrow();
  });
});
