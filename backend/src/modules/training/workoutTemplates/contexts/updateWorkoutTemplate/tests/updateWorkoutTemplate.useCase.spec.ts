import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateWorkoutTemplateUseCase } from "../updateWorkoutTemplate.useCase";

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
  update: vi.fn().mockResolvedValue({
    id: "workout-id-1",
    programTemplateId: "template-id-1",
    name: "Treino A Atualizado",
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

describe("UpdateWorkoutTemplateUseCase", () => {
  let useCase: UpdateWorkoutTemplateUseCase;
  let workoutTemplatesRepository: ReturnType<typeof makeWorkoutTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    workoutTemplatesRepository = makeWorkoutTemplatesRepository();
    useCase = new UpdateWorkoutTemplateUseCase(workoutTemplatesRepository as any);
  });

  it("should update workout template successfully", async () => {
    const result = await useCase.execute(
      "workout-id-1",
      { name: "Treino A Atualizado" },
      tenantId,
    );

    expect(result.name).toBe("Treino A Atualizado");
  });

  it("should throw NotFoundException when workout not found", async () => {
    workoutTemplatesRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { name: "Novo Nome" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout belongs to different tenant", async () => {
    workoutTemplatesRepository.findByIdWithTenant.mockResolvedValue(
      makeWorkoutWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("workout-id-1", { name: "Novo Nome" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should support partial updates", async () => {
    await useCase.execute("workout-id-1", { name: "Treino B" }, tenantId);

    expect(workoutTemplatesRepository.update).toHaveBeenCalledWith(
      "workout-id-1",
      expect.objectContaining({ name: "Treino B" }),
    );
  });

  it("should throw ValidationException when name is too short", async () => {
    await expect(
      useCase.execute("workout-id-1", { name: "AB" }, tenantId),
    ).rejects.toThrow();
  });
});
