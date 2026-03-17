import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ReorderWorkoutTemplatesUseCase } from "../reorderWorkoutTemplates.useCase";

const makeProgramTemplate = () => ({
  id: "template-id-1",
  tenantId: "tenant-id-1",
  name: "Programa de Força",
  description: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeProgramTemplatesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeProgramTemplate()),
});

const makeWorkoutTemplatesRepository = () => ({
  reorder: vi.fn().mockResolvedValue(undefined),
});

describe("ReorderWorkoutTemplatesUseCase", () => {
  let useCase: ReorderWorkoutTemplatesUseCase;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;
  let workoutTemplatesRepository: ReturnType<typeof makeWorkoutTemplatesRepository>;

  const tenantId = "tenant-id-1";

  const validBody = {
    items: [
      { id: "workout-id-1", order: 0 },
      { id: "workout-id-2", order: 1 },
    ],
  };

  beforeEach(() => {
    programTemplatesRepository = makeProgramTemplatesRepository();
    workoutTemplatesRepository = makeWorkoutTemplatesRepository();
    useCase = new ReorderWorkoutTemplatesUseCase(
      programTemplatesRepository as any,
      workoutTemplatesRepository as any,
    );
  });

  it("should reorder workout templates successfully", async () => {
    await expect(
      useCase.execute("template-id-1", validBody, tenantId),
    ).resolves.toBeUndefined();

    expect(workoutTemplatesRepository.reorder).toHaveBeenCalledWith(validBody.items);
  });

  it("should throw NotFoundException when program template not found", async () => {
    programTemplatesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", validBody, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when program template belongs to different tenant", async () => {
    programTemplatesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("template-id-1", validBody, "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when items array is empty", async () => {
    await expect(
      useCase.execute("template-id-1", { items: [] }, tenantId),
    ).rejects.toThrow();
  });
});
