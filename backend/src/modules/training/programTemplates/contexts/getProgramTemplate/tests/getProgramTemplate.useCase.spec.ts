import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetProgramTemplateUseCase } from "../getProgramTemplate.useCase";

const makeTemplateWithTree = (overrides = {}) => ({
  id: "template-id-1",
  tenantId: "tenant-id-1",
  name: "Programa de Força",
  description: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  workoutTemplates: [
    {
      id: "workout-id-1",
      programTemplateId: "template-id-1",
      name: "Treino A",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      exerciseTemplates: [
        {
          id: "exercise-template-id-1",
          workoutTemplateId: "workout-id-1",
          exerciseId: "exercise-id-1",
          sets: 3,
          repetitions: 10,
          restSeconds: 60,
          duration: null,
          order: 1,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          exercise: {
            id: "exercise-id-1",
            name: "Supino Reto",
            muscleGroup: "peitoral",
            mediaUrl: null,
          },
        },
      ],
    },
  ],
  ...overrides,
});

const makeProgramTemplatesRepository = () => ({
  findByIdWithTree: vi.fn().mockResolvedValue(makeTemplateWithTree()),
});

describe("GetProgramTemplateUseCase", () => {
  let useCase: GetProgramTemplateUseCase;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    programTemplatesRepository = makeProgramTemplatesRepository();
    useCase = new GetProgramTemplateUseCase(programTemplatesRepository as any);
  });

  it("should return program template with full tree", async () => {
    const result = await useCase.execute("template-id-1", tenantId);

    expect(result.id).toBe("template-id-1");
    expect(result.workoutTemplates).toHaveLength(1);
    expect(result.workoutTemplates[0].exerciseTemplates).toHaveLength(1);
    expect(result.workoutTemplates[0].exerciseTemplates[0].exercise.name).toBe(
      "Supino Reto",
    );
  });

  it("should throw NotFoundException when template not found", async () => {
    programTemplatesRepository.findByIdWithTree.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when template belongs to different tenant", async () => {
    programTemplatesRepository.findByIdWithTree.mockResolvedValue(undefined);

    await expect(
      useCase.execute("template-id-1", "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should return template with empty tree when no workouts", async () => {
    programTemplatesRepository.findByIdWithTree.mockResolvedValue(
      makeTemplateWithTree({ workoutTemplates: [] }),
    );

    const result = await useCase.execute("template-id-1", tenantId);

    expect(result.workoutTemplates).toHaveLength(0);
  });
});
