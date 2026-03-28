import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteStudentExerciseUseCase } from "../deleteStudentExercise.useCase";

const makeStudentExerciseWithTenant = (tenantId = "tenant-id-1") => ({
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
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeStudentExercisesRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeStudentExerciseWithTenant()),
  delete: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteStudentExerciseUseCase", () => {
  let useCase: DeleteStudentExerciseUseCase;
  let studentExercisesRepository: ReturnType<typeof makeStudentExercisesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentExercisesRepository = makeStudentExercisesRepository();
    useCase = new DeleteStudentExerciseUseCase(studentExercisesRepository as any);
  });

  it("should delete student exercise successfully", async () => {
    await expect(
      useCase.execute("student-exercise-id-1", tenantId),
    ).resolves.toBeUndefined();

    expect(studentExercisesRepository.delete).toHaveBeenCalledWith("student-exercise-id-1");
  });

  it("should throw NotFoundException when exercise not found", async () => {
    studentExercisesRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when exercise belongs to different tenant", async () => {
    studentExercisesRepository.findByIdWithTenant.mockResolvedValue(
      makeStudentExerciseWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("student-exercise-id-1", tenantId),
    ).rejects.toThrow(NotFoundException);
  });
});
