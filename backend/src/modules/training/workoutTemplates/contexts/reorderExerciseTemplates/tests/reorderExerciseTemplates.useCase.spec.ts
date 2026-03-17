import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ReorderExerciseTemplatesUseCase } from "../reorderExerciseTemplates.useCase";

const makeWorkoutWithTenant = (tenantId = "tenant-id-1") => ({
  id: "workout-id-1",
  programTemplateId: "template-id-1",
  name: "Treino A",
  order: 1,
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutTemplatesRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeWorkoutWithTenant()),
});

const makeExerciseTemplatesRepository = () => ({
  reorder: vi.fn().mockResolvedValue(undefined),
});

describe("ReorderExerciseTemplatesUseCase", () => {
  let useCase: ReorderExerciseTemplatesUseCase;
  let workoutTemplatesRepository: ReturnType<typeof makeWorkoutTemplatesRepository>;
  let exerciseTemplatesRepository: ReturnType<typeof makeExerciseTemplatesRepository>;

  const tenantId = "tenant-id-1";

  const validBody = {
    items: [
      { id: "exercise-template-id-1", order: 0 },
      { id: "exercise-template-id-2", order: 1 },
    ],
  };

  beforeEach(() => {
    workoutTemplatesRepository = makeWorkoutTemplatesRepository();
    exerciseTemplatesRepository = makeExerciseTemplatesRepository();
    useCase = new ReorderExerciseTemplatesUseCase(
      workoutTemplatesRepository as any,
      exerciseTemplatesRepository as any,
    );
  });

  it("should reorder exercise templates successfully", async () => {
    await expect(
      useCase.execute("workout-id-1", validBody, tenantId),
    ).resolves.toBeUndefined();

    expect(exerciseTemplatesRepository.reorder).toHaveBeenCalledWith(validBody.items);
  });

  it("should throw NotFoundException when workout not found", async () => {
    workoutTemplatesRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout belongs to different tenant", async () => {
    workoutTemplatesRepository.findByIdWithTenant.mockResolvedValue(
      makeWorkoutWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("workout-id-1", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when items array is empty", async () => {
    await expect(
      useCase.execute("workout-id-1", { items: [] }, tenantId),
    ).rejects.toThrow();
  });
});
