import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { AddWorkoutDayUseCase } from "../addWorkoutDay.useCase";

const makeProgram = () => ({
  id: "program-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  programTemplateId: null,
  name: "Programa A",
  status: "active" as const,
  startedAt: new Date(),
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutDay = () => ({
  id: "workout-day-id-1",
  studentProgramId: "program-id-1",
  name: "Treino A",
  description: null,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeStudentProgramsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeProgram()),
});

const makeWorkoutDaysRepository = () => ({
  findMaxOrderByStudentProgramId: vi.fn().mockResolvedValue(-1),
  create: vi.fn().mockResolvedValue(makeWorkoutDay()),
});

describe("AddWorkoutDayUseCase", () => {
  let useCase: AddWorkoutDayUseCase;
  let studentProgramsRepository: ReturnType<typeof makeStudentProgramsRepository>;
  let workoutDaysRepository: ReturnType<typeof makeWorkoutDaysRepository>;

  const tenantId = "tenant-id-1";
  const validBody = { name: "Treino A" };

  beforeEach(() => {
    studentProgramsRepository = makeStudentProgramsRepository();
    workoutDaysRepository = makeWorkoutDaysRepository();
    useCase = new AddWorkoutDayUseCase(
      studentProgramsRepository as any,
      workoutDaysRepository as any,
    );
  });

  it("should add workout day successfully", async () => {
    const result = await useCase.execute("program-id-1", validBody, tenantId);

    expect(result.name).toBe("Treino A");
    expect(workoutDaysRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentProgramId: "program-id-1", order: 0 }),
    );
  });

  it("should set order to next after max", async () => {
    workoutDaysRepository.findMaxOrderByStudentProgramId.mockResolvedValue(2);

    await useCase.execute("program-id-1", validBody, tenantId);

    expect(workoutDaysRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ order: 3 }),
    );
  });

  it("should throw NotFoundException when program not found", async () => {
    studentProgramsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when name is missing", async () => {
    await expect(
      useCase.execute("program-id-1", {}, tenantId),
    ).rejects.toThrow();
  });
});
