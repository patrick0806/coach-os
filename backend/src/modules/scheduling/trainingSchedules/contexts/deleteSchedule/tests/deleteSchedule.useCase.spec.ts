import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { DeleteTrainingScheduleUseCase } from "../deleteSchedule.useCase";

const SCHEDULE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeSchedule = () => ({
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
});

const makeRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeSchedule()),
  delete: vi.fn().mockResolvedValue(true),
});

describe("DeleteTrainingScheduleUseCase", () => {
  let useCase: DeleteTrainingScheduleUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new DeleteTrainingScheduleUseCase(repository as any);
  });

  it("should delete a training schedule successfully", async () => {
    await useCase.execute(SCHEDULE_ID, TENANT_ID);

    expect(repository.delete).toHaveBeenCalledWith(SCHEDULE_ID, TENANT_ID);
  });

  it("should throw NotFoundException when schedule not found", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute(SCHEDULE_ID, TENANT_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw NotFoundException when schedule belongs to different tenant", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(SCHEDULE_ID, "different-tenant"),
    ).rejects.toThrow(NotFoundException);
  });
});
