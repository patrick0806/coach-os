import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteWorkoutTemplateUseCase } from "../deleteWorkoutTemplate.useCase";

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
  delete: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteWorkoutTemplateUseCase", () => {
  let useCase: DeleteWorkoutTemplateUseCase;
  let workoutTemplatesRepository: ReturnType<typeof makeWorkoutTemplatesRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    workoutTemplatesRepository = makeWorkoutTemplatesRepository();
    useCase = new DeleteWorkoutTemplateUseCase(workoutTemplatesRepository as any);
  });

  it("should delete workout template successfully", async () => {
    await expect(
      useCase.execute("workout-id-1", tenantId),
    ).resolves.toBeUndefined();

    expect(workoutTemplatesRepository.delete).toHaveBeenCalledWith("workout-id-1");
  });

  it("should throw NotFoundException when workout not found", async () => {
    workoutTemplatesRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout belongs to different tenant", async () => {
    workoutTemplatesRepository.findByIdWithTenant.mockResolvedValue(
      makeWorkoutWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("workout-id-1", tenantId),
    ).rejects.toThrow(NotFoundException);
  });
});
