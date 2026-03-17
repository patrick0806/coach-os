import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { AddWorkoutTemplateUseCase } from "../addWorkoutTemplate.useCase";

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
  findMaxOrderByProgramTemplateId: vi.fn().mockResolvedValue(2),
  create: vi.fn().mockResolvedValue({
    id: "workout-id-1",
    programTemplateId: "template-id-1",
    name: "Treino A",
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

describe("AddWorkoutTemplateUseCase", () => {
  let useCase: AddWorkoutTemplateUseCase;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;
  let workoutTemplatesRepository: ReturnType<typeof makeWorkoutTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    programTemplatesRepository = makeProgramTemplatesRepository();
    workoutTemplatesRepository = makeWorkoutTemplatesRepository();
    useCase = new AddWorkoutTemplateUseCase(
      programTemplatesRepository as any,
      workoutTemplatesRepository as any,
    );
  });

  it("should add workout template successfully", async () => {
    const result = await useCase.execute(
      "template-id-1",
      { name: "Treino A" },
      tenantId,
    );

    expect(result.name).toBe("Treino A");
    expect(result.order).toBe(3);
  });

  it("should set order to 0 when no workouts exist", async () => {
    workoutTemplatesRepository.findMaxOrderByProgramTemplateId.mockResolvedValue(-1);

    await useCase.execute("template-id-1", { name: "Treino A" }, tenantId);

    expect(workoutTemplatesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ order: 0 }),
    );
  });

  it("should throw NotFoundException when program template not found", async () => {
    programTemplatesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { name: "Treino A" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when program template belongs to different tenant", async () => {
    programTemplatesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("template-id-1", { name: "Treino A" }, "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ValidationException when name is missing", async () => {
    await expect(
      useCase.execute("template-id-1", {}, tenantId),
    ).rejects.toThrow();
  });
});
