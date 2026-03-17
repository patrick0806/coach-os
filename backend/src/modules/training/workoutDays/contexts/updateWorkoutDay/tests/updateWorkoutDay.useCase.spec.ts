import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateWorkoutDayUseCase } from "../updateWorkoutDay.useCase";

const makeWorkoutDayWithTenant = (overrides = {}) => ({
  id: "day-id-1",
  studentProgramId: "program-id-1",
  name: "Treino A",
  description: null,
  order: 1,
  tenantId: "tenant-id-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeWorkoutDay = (overrides = {}) => ({
  id: "day-id-1",
  studentProgramId: "program-id-1",
  name: "Treino A Atualizado",
  description: null,
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeWorkoutDaysRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeWorkoutDayWithTenant()),
  update: vi.fn().mockResolvedValue(makeWorkoutDay()),
});

describe("UpdateWorkoutDayUseCase", () => {
  let useCase: UpdateWorkoutDayUseCase;
  let workoutDaysRepository: ReturnType<typeof makeWorkoutDaysRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    workoutDaysRepository = makeWorkoutDaysRepository();
    useCase = new UpdateWorkoutDayUseCase(workoutDaysRepository as any);
  });

  it("should update workout day", async () => {
    const result = await useCase.execute(
      "day-id-1",
      { name: "Treino A Atualizado" },
      tenantId,
    );

    expect(workoutDaysRepository.update).toHaveBeenCalledWith(
      "day-id-1",
      expect.objectContaining({ name: "Treino A Atualizado" }),
    );
    expect(result.name).toBe("Treino A Atualizado");
  });

  it("should throw NotFoundException when workout day not found", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", { name: "Treino" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout day belongs to different tenant", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue(
      makeWorkoutDayWithTenant({ tenantId: "other-tenant-id" }),
    );

    await expect(
      useCase.execute("day-id-1", { name: "Treino" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow partial updates", async () => {
    await useCase.execute("day-id-1", { description: "Nova descrição" }, tenantId);

    expect(workoutDaysRepository.update).toHaveBeenCalledWith(
      "day-id-1",
      expect.objectContaining({ description: "Nova descrição" }),
    );
  });

  it("should allow updating order", async () => {
    await useCase.execute("day-id-1", { order: 2 }, tenantId);

    expect(workoutDaysRepository.update).toHaveBeenCalledWith(
      "day-id-1",
      expect.objectContaining({ order: 2 }),
    );
  });
});
