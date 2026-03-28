import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { AddStudentExerciseUseCase } from "../addStudentExercise.useCase";

const makeWorkoutDayWithTenant = (tenantId = "tenant-id-1") => ({
  id: "workout-day-id-1",
  studentProgramId: "program-id-1",
  name: "Treino A",
  description: null,
  order: 0,
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

const makeStudentExercise = () => ({
  id: "student-exercise-id-1",
  workoutDayId: "workout-day-id-1",
  exerciseId: "exercise-id-1",
  sets: 3,
  repetitions: 10,
  plannedWeight: null,
  restSeconds: 60,
  duration: null,
  order: 0,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutDaysRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeWorkoutDayWithTenant()),
});

const makeStudentExercisesRepository = () => ({
  findMaxOrderByWorkoutDayId: vi.fn().mockResolvedValue(-1),
  create: vi.fn().mockResolvedValue(makeStudentExercise()),
});

const makeExercisesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeExercise()),
});

describe("AddStudentExerciseUseCase", () => {
  let useCase: AddStudentExerciseUseCase;
  let workoutDaysRepository: ReturnType<typeof makeWorkoutDaysRepository>;
  let studentExercisesRepository: ReturnType<typeof makeStudentExercisesRepository>;
  let exercisesRepository: ReturnType<typeof makeExercisesRepository>;

  const tenantId = "tenant-id-1";
  const validBody = {
    exerciseId: "exercise-id-1",
    sets: 3,
    repetitions: 10,
    restSeconds: 60,
  };

  beforeEach(() => {
    workoutDaysRepository = makeWorkoutDaysRepository();
    studentExercisesRepository = makeStudentExercisesRepository();
    exercisesRepository = makeExercisesRepository();
    useCase = new AddStudentExerciseUseCase(
      workoutDaysRepository as any,
      studentExercisesRepository as any,
      exercisesRepository as any,
    );
  });

  it("should add exercise successfully", async () => {
    const result = await useCase.execute("workout-day-id-1", validBody, tenantId);

    expect(result.exerciseId).toBe("exercise-id-1");
    expect(result.sets).toBe(3);
    expect(studentExercisesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ workoutDayId: "workout-day-id-1", order: 0 }),
    );
  });

  it("should set order to next after max", async () => {
    studentExercisesRepository.findMaxOrderByWorkoutDayId.mockResolvedValue(1);

    await useCase.execute("workout-day-id-1", validBody, tenantId);

    expect(studentExercisesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ order: 2 }),
    );
  });

  it("should throw NotFoundException when workout day not found", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout day belongs to different tenant", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue(
      makeWorkoutDayWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("workout-day-id-1", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when exercise not found", async () => {
    exercisesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("workout-day-id-1", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when exercise belongs to different tenant", async () => {
    exercisesRepository.findById.mockResolvedValue(makeExercise("other-tenant-id"));

    await expect(
      useCase.execute("workout-day-id-1", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when sets is missing", async () => {
    await expect(
      useCase.execute("workout-day-id-1", { exerciseId: "exercise-id-1" }, tenantId),
    ).rejects.toThrow();
  });
});
