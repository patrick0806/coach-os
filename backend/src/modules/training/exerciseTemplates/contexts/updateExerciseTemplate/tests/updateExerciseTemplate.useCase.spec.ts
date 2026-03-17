import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateExerciseTemplateUseCase } from "../updateExerciseTemplate.useCase";

const makeExerciseTemplateWithTenant = (tenantId = "tenant-id-1") => ({
  id: "exercise-template-id-1",
  workoutTemplateId: "workout-id-1",
  exerciseId: "exercise-id-1",
  sets: 3,
  repetitions: 10,
  restSeconds: 60,
  duration: null,
  order: 1,
  notes: null,
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeExerciseTemplatesRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeExerciseTemplateWithTenant()),
  update: vi.fn().mockResolvedValue({
    id: "exercise-template-id-1",
    workoutTemplateId: "workout-id-1",
    exerciseId: "exercise-id-1",
    sets: 4,
    repetitions: 12,
    restSeconds: 60,
    duration: null,
    order: 1,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

describe("UpdateExerciseTemplateUseCase", () => {
  let useCase: UpdateExerciseTemplateUseCase;
  let exerciseTemplatesRepository: ReturnType<typeof makeExerciseTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    exerciseTemplatesRepository = makeExerciseTemplatesRepository();
    useCase = new UpdateExerciseTemplateUseCase(exerciseTemplatesRepository as any);
  });

  it("should update exercise template successfully", async () => {
    const result = await useCase.execute(
      "exercise-template-id-1",
      { sets: 4, repetitions: 12 },
      tenantId,
    );

    expect(result.sets).toBe(4);
    expect(result.repetitions).toBe(12);
  });

  it("should throw NotFoundException when exercise template not found", async () => {
    exerciseTemplatesRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { sets: 4 }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when exercise template belongs to different tenant", async () => {
    exerciseTemplatesRepository.findByIdWithTenant.mockResolvedValue(
      makeExerciseTemplateWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("exercise-template-id-1", { sets: 4 }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should support partial updates", async () => {
    await useCase.execute(
      "exercise-template-id-1",
      { restSeconds: 90, notes: "Aumentar carga" },
      tenantId,
    );

    expect(exerciseTemplatesRepository.update).toHaveBeenCalledWith(
      "exercise-template-id-1",
      expect.objectContaining({ restSeconds: 90, notes: "Aumentar carga" }),
    );
  });

  it("should throw ValidationException when sets is less than 1", async () => {
    await expect(
      useCase.execute("exercise-template-id-1", { sets: 0 }, tenantId),
    ).rejects.toThrow();
  });
});
