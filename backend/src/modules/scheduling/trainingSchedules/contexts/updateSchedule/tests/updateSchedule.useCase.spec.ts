import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { UpdateTrainingScheduleUseCase } from "../updateSchedule.useCase";

const SCHEDULE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeSchedule = (overrides = {}) => ({
  id: SCHEDULE_ID,
  tenantId: TENANT_ID,
  studentId: "student-id",
  studentProgramId: null,
  dayOfWeek: 1,
  startTime: "10:00",
  endTime: "11:00",
  location: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeSchedule()),
  update: vi.fn().mockResolvedValue(makeSchedule({ startTime: "09:00" })),
});

describe("UpdateTrainingScheduleUseCase", () => {
  let useCase: UpdateTrainingScheduleUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new UpdateTrainingScheduleUseCase(repository as any);
  });

  it("should update a training schedule successfully", async () => {
    const result = await useCase.execute(
      SCHEDULE_ID,
      { startTime: "09:00" },
      TENANT_ID,
    );

    expect(result.startTime).toBe("09:00");
    expect(repository.update).toHaveBeenCalledWith(
      SCHEDULE_ID,
      TENANT_ID,
      expect.objectContaining({ startTime: "09:00" }),
    );
  });

  it("should throw NotFoundException when schedule not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(SCHEDULE_ID, { startTime: "09:00" }, TENANT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when schedule belongs to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(SCHEDULE_ID, { startTime: "09:00" }, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });

  it("should allow partial update", async () => {
    await useCase.execute(SCHEDULE_ID, { location: "New Gym" }, TENANT_ID);

    expect(repository.update).toHaveBeenCalledWith(
      SCHEDULE_ID,
      TENANT_ID,
      expect.objectContaining({ location: "New Gym" }),
    );
  });

  it("should throw validation error for invalid time format", async () => {
    await expect(
      useCase.execute(SCHEDULE_ID, { startTime: "invalid" }, TENANT_ID),
    ).rejects.toThrow();
  });
});
