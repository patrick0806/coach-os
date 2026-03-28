import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ReorderStudentExercisesUseCase } from "../reorderStudentExercises.useCase";

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

const makeWorkoutDaysRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeWorkoutDayWithTenant()),
});

const makeStudentExercisesRepository = () => ({
  reorder: vi.fn().mockResolvedValue(undefined),
});

describe("ReorderStudentExercisesUseCase", () => {
  let useCase: ReorderStudentExercisesUseCase;
  let workoutDaysRepository: ReturnType<typeof makeWorkoutDaysRepository>;
  let studentExercisesRepository: ReturnType<typeof makeStudentExercisesRepository>;

  const tenantId = "tenant-id-1";
  const validBody = {
    items: [
      { id: "exercise-id-1", order: 0 },
      { id: "exercise-id-2", order: 1 },
    ],
  };

  beforeEach(() => {
    workoutDaysRepository = makeWorkoutDaysRepository();
    studentExercisesRepository = makeStudentExercisesRepository();
    useCase = new ReorderStudentExercisesUseCase(
      workoutDaysRepository as any,
      studentExercisesRepository as any,
    );
  });

  it("should reorder exercises successfully", async () => {
    await expect(
      useCase.execute("workout-day-id-1", validBody, tenantId),
    ).resolves.toBeUndefined();

    expect(studentExercisesRepository.reorder).toHaveBeenCalledWith(
      "workout-day-id-1",
      validBody.items,
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

  it("should throw ValidationException when items array is empty", async () => {
    await expect(
      useCase.execute("workout-day-id-1", { items: [] }, tenantId),
    ).rejects.toThrow();
  });
});
