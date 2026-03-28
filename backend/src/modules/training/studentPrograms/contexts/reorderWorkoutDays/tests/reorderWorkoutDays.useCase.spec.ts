import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ReorderWorkoutDaysUseCase } from "../reorderWorkoutDays.useCase";

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

const makeStudentProgramsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeProgram()),
});

const makeWorkoutDaysRepository = () => ({
  reorder: vi.fn().mockResolvedValue(undefined),
});

describe("ReorderWorkoutDaysUseCase", () => {
  let useCase: ReorderWorkoutDaysUseCase;
  let studentProgramsRepository: ReturnType<typeof makeStudentProgramsRepository>;
  let workoutDaysRepository: ReturnType<typeof makeWorkoutDaysRepository>;

  const tenantId = "tenant-id-1";
  const validBody = {
    items: [
      { id: "day-id-1", order: 0 },
      { id: "day-id-2", order: 1 },
    ],
  };

  beforeEach(() => {
    studentProgramsRepository = makeStudentProgramsRepository();
    workoutDaysRepository = makeWorkoutDaysRepository();
    useCase = new ReorderWorkoutDaysUseCase(
      studentProgramsRepository as any,
      workoutDaysRepository as any,
    );
  });

  it("should reorder workout days successfully", async () => {
    await expect(
      useCase.execute("program-id-1", validBody, tenantId),
    ).resolves.toBeUndefined();

    expect(workoutDaysRepository.reorder).toHaveBeenCalledWith(
      "program-id-1",
      validBody.items,
    );
  });

  it("should throw NotFoundException when program not found", async () => {
    studentProgramsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when items array is empty", async () => {
    await expect(
      useCase.execute("program-id-1", { items: [] }, tenantId),
    ).rejects.toThrow();
  });
});
