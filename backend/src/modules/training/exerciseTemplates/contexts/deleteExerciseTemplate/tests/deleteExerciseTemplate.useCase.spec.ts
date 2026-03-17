import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteExerciseTemplateUseCase } from "../deleteExerciseTemplate.useCase";

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
  delete: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteExerciseTemplateUseCase", () => {
  let useCase: DeleteExerciseTemplateUseCase;
  let exerciseTemplatesRepository: ReturnType<typeof makeExerciseTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    exerciseTemplatesRepository = makeExerciseTemplatesRepository();
    useCase = new DeleteExerciseTemplateUseCase(exerciseTemplatesRepository as any);
  });

  it("should delete exercise template successfully", async () => {
    await expect(
      useCase.execute("exercise-template-id-1", tenantId),
    ).resolves.toBeUndefined();

    expect(exerciseTemplatesRepository.delete).toHaveBeenCalledWith(
      "exercise-template-id-1",
    );
  });

  it("should throw NotFoundException when exercise template not found", async () => {
    exerciseTemplatesRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when exercise template belongs to different tenant", async () => {
    exerciseTemplatesRepository.findByIdWithTenant.mockResolvedValue(
      makeExerciseTemplateWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("exercise-template-id-1", tenantId),
    ).rejects.toThrow(NotFoundException);
  });
});
