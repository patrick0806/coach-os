import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateStudentExerciseUseCase } from "../updateStudentExercise.useCase";

const makeStudentExerciseWithTenant = (overrides = {}) => ({
  id: "student-exercise-id-1",
  workoutDayId: "day-id-1",
  exerciseId: "exercise-id-1",
  sets: 3,
  repetitions: 10,
  plannedWeight: null,
  restSeconds: 60,
  duration: null,
  order: 1,
  notes: null,
  tenantId: "tenant-id-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeStudentExercise = (overrides = {}) => ({
  id: "student-exercise-id-1",
  workoutDayId: "day-id-1",
  exerciseId: "exercise-id-1",
  sets: 4,
  repetitions: 12,
  plannedWeight: "80.00",
  restSeconds: 90,
  duration: null,
  order: 1,
  notes: "Focar na forma",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeStudentExercisesRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeStudentExerciseWithTenant()),
  update: vi.fn().mockResolvedValue(makeStudentExercise()),
});

describe("UpdateStudentExerciseUseCase", () => {
  let useCase: UpdateStudentExerciseUseCase;
  let studentExercisesRepository: ReturnType<typeof makeStudentExercisesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentExercisesRepository = makeStudentExercisesRepository();
    useCase = new UpdateStudentExerciseUseCase(studentExercisesRepository as any);
  });

  it("should update student exercise", async () => {
    const result = await useCase.execute(
      "student-exercise-id-1",
      { sets: 4, repetitions: 12, plannedWeight: "80.00", restSeconds: 90, notes: "Focar na forma" },
      tenantId,
    );

    expect(studentExercisesRepository.update).toHaveBeenCalledWith(
      "student-exercise-id-1",
      expect.objectContaining({ sets: 4, repetitions: 12 }),
    );
    expect(result.sets).toBe(4);
    expect(result.plannedWeight).toBe("80.00");
  });

  it("should throw NotFoundException when student exercise not found", async () => {
    studentExercisesRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { sets: 3 }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when student exercise belongs to different tenant", async () => {
    studentExercisesRepository.findByIdWithTenant.mockResolvedValue(
      makeStudentExerciseWithTenant({ tenantId: "other-tenant-id" }),
    );

    await expect(
      useCase.execute("student-exercise-id-1", { sets: 3 }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow partial updates with nullable fields", async () => {
    studentExercisesRepository.update.mockResolvedValue(
      makeStudentExercise({ notes: null, plannedWeight: null }),
    );

    await useCase.execute(
      "student-exercise-id-1",
      { notes: null, plannedWeight: null },
      tenantId,
    );

    expect(studentExercisesRepository.update).toHaveBeenCalledWith(
      "student-exercise-id-1",
      expect.objectContaining({ notes: null, plannedWeight: null }),
    );
  });

  it("should allow updating duration", async () => {
    await useCase.execute(
      "student-exercise-id-1",
      { duration: "30s" },
      tenantId,
    );

    expect(studentExercisesRepository.update).toHaveBeenCalledWith(
      "student-exercise-id-1",
      expect.objectContaining({ duration: "30s" }),
    );
  });
});
