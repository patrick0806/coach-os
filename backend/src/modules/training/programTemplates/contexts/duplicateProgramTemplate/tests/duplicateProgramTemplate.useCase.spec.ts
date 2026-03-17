import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DuplicateProgramTemplateUseCase } from "../duplicateProgramTemplate.useCase";

const makeExerciseTemplate = () => ({
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
});

const makeWorkoutTemplate = () => ({
  id: "workout-id-1",
  programTemplateId: "template-id-1",
  name: "Treino A",
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  exerciseTemplates: [makeExerciseTemplate()],
});

const makeTemplateWithTree = () => ({
  id: "template-id-1",
  tenantId: "tenant-id-1",
  name: "Programa de Força",
  description: "Descrição",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  workoutTemplates: [makeWorkoutTemplate()],
});

const makeProgramTemplatesRepository = () => ({
  findByIdWithTree: vi.fn().mockResolvedValue(makeTemplateWithTree()),
  create: vi.fn().mockResolvedValue({
    id: "new-template-id",
    tenantId: "tenant-id-1",
    name: "Programa de Força (cópia)",
    description: "Descrição",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

const makeWorkoutTemplatesRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "new-workout-id",
    programTemplateId: "new-template-id",
    name: "Treino A",
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

const makeExerciseTemplatesRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "new-exercise-template-id",
    workoutTemplateId: "new-workout-id",
    exerciseId: "exercise-id-1",
    sets: 3,
    repetitions: 10,
    restSeconds: 60,
    duration: null,
    order: 1,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

const makeDrizzle = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (fn: (tx: any) => Promise<void>) => {
      await fn({});
    }),
  },
});

describe("DuplicateProgramTemplateUseCase", () => {
  let useCase: DuplicateProgramTemplateUseCase;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;
  let workoutTemplatesRepository: ReturnType<typeof makeWorkoutTemplatesRepository>;
  let exerciseTemplatesRepository: ReturnType<typeof makeExerciseTemplatesRepository>;
  let drizzle: ReturnType<typeof makeDrizzle>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    programTemplatesRepository = makeProgramTemplatesRepository();
    workoutTemplatesRepository = makeWorkoutTemplatesRepository();
    exerciseTemplatesRepository = makeExerciseTemplatesRepository();
    drizzle = makeDrizzle();

    useCase = new DuplicateProgramTemplateUseCase(
      programTemplatesRepository as any,
      workoutTemplatesRepository as any,
      exerciseTemplatesRepository as any,
      drizzle as any,
    );
  });

  it("should duplicate program template with (cópia) suffix", async () => {
    const result = await useCase.execute("template-id-1", tenantId);

    expect(programTemplatesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Programa de Força (cópia)",
        tenantId,
      }),
    );
    expect(result.name).toBe("Programa de Força (cópia)");
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

  it("should deep copy workout templates and exercise templates", async () => {
    await useCase.execute("template-id-1", tenantId);

    expect(workoutTemplatesRepository.create).toHaveBeenCalledTimes(1);
    expect(exerciseTemplatesRepository.create).toHaveBeenCalledTimes(1);

    expect(exerciseTemplatesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: "exercise-id-1",
        sets: 3,
        repetitions: 10,
      }),
    );
  });
});
