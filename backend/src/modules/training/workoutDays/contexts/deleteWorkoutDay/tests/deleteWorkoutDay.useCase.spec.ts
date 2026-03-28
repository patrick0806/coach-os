import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteWorkoutDayUseCase } from "../deleteWorkoutDay.useCase";

const makeWorkoutDayWithTenant = (tenantId = "tenant-id-1") => ({
  id: "workout-day-id-1",
  studentProgramId: "program-id-1",
  name: "Treino A",
  description: null,
  order: 0,
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutDaysRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeWorkoutDayWithTenant()),
  delete: vi.fn().mockResolvedValue(undefined),
});

describe("DeleteWorkoutDayUseCase", () => {
  let useCase: DeleteWorkoutDayUseCase;
  let workoutDaysRepository: ReturnType<typeof makeWorkoutDaysRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    workoutDaysRepository = makeWorkoutDaysRepository();
    useCase = new DeleteWorkoutDayUseCase(workoutDaysRepository as any);
  });

  it("should delete workout day successfully", async () => {
    await expect(
      useCase.execute("workout-day-id-1", tenantId),
    ).resolves.toBeUndefined();

    expect(workoutDaysRepository.delete).toHaveBeenCalledWith("workout-day-id-1");
  });

  it("should throw NotFoundException when workout day not found", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-id", tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout day belongs to different tenant", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue(
      makeWorkoutDayWithTenant("other-tenant-id"),
    );

    await expect(
      useCase.execute("workout-day-id-1", tenantId),
    ).rejects.toThrow(NotFoundException);
  });
});
