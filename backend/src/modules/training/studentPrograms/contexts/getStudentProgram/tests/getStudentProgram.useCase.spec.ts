import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetStudentProgramUseCase } from "../getStudentProgram.useCase";

const makeStudentProgramWithTree = () => ({
  id: "program-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  programTemplateId: null,
  name: "Programa de Força",
  status: "active",
  startedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  workoutDays: [
    {
      id: "day-id-1",
      studentProgramId: "program-id-1",
      name: "Treino A",
      description: null,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      studentExercises: [
        {
          id: "exercise-id-1",
          workoutDayId: "day-id-1",
          exerciseId: "ex-id-1",
          sets: 3,
          repetitions: 10,
          plannedWeight: null,
          restSeconds: 60,
          duration: null,
          order: 1,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          exercise: {
            id: "ex-id-1",
            name: "Supino Reto",
            muscleGroup: "peitoral",
            mediaUrl: null,
            youtubeUrl: null,
          },
        },
      ],
    },
  ],
});

const makeStudentProgramsRepository = () => ({
  findByIdWithTree: vi.fn().mockResolvedValue(makeStudentProgramWithTree()),
});

describe("GetStudentProgramUseCase", () => {
  let useCase: GetStudentProgramUseCase;
  let studentProgramsRepository: ReturnType<typeof makeStudentProgramsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentProgramsRepository = makeStudentProgramsRepository();
    useCase = new GetStudentProgramUseCase(studentProgramsRepository as any);
  });

  it("should return program with full tree", async () => {
    const result = await useCase.execute("program-id-1", tenantId);

    expect(result.id).toBe("program-id-1");
    expect(result.workoutDays).toHaveLength(1);
    expect(result.workoutDays[0].studentExercises).toHaveLength(1);
    expect(result.workoutDays[0].studentExercises[0].exercise.name).toBe("Supino Reto");
  });

  it("should throw NotFoundException when program not found", async () => {
    studentProgramsRepository.findByIdWithTree.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when program belongs to different tenant", async () => {
    studentProgramsRepository.findByIdWithTree.mockResolvedValue(undefined);

    await expect(
      useCase.execute("program-id-1", "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should return program with empty workout days", async () => {
    studentProgramsRepository.findByIdWithTree.mockResolvedValue({
      ...makeStudentProgramWithTree(),
      workoutDays: [],
    });

    const result = await useCase.execute("program-id-1", tenantId);

    expect(result.workoutDays).toHaveLength(0);
  });

  it("should call repository with correct params", async () => {
    await useCase.execute("program-id-1", tenantId);

    expect(studentProgramsRepository.findByIdWithTree).toHaveBeenCalledWith(
      "program-id-1",
      tenantId,
    );
  });
});
