import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { FinishWorkoutSessionUseCase } from "../finishSession.useCase";

const makeSession = () => ({
  id: "session-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  workoutDayId: "workout-day-id-1",
  status: "started" as const,
  startedAt: new Date(),
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutSessionsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeSession()),
  update: vi.fn().mockResolvedValue({
    ...makeSession(),
    status: "finished" as const,
    finishedAt: new Date(),
  }),
});

describe("FinishWorkoutSessionUseCase", () => {
  let useCase: FinishWorkoutSessionUseCase;
  let workoutSessionsRepository: ReturnType<typeof makeWorkoutSessionsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    workoutSessionsRepository = makeWorkoutSessionsRepository();
    useCase = new FinishWorkoutSessionUseCase(workoutSessionsRepository as any);
  });

  it("should finish a session successfully", async () => {
    const result = await useCase.execute("session-id-1", tenantId);

    expect(workoutSessionsRepository.update).toHaveBeenCalledWith(
      "session-id-1",
      tenantId,
      expect.objectContaining({ status: "finished", finishedAt: expect.any(Date) }),
    );
    expect(result.status).toBe("finished");
  });

  it("should set finishedAt when finishing", async () => {
    await useCase.execute("session-id-1", tenantId);

    const callArgs = workoutSessionsRepository.update.mock.calls[0][2];
    expect(callArgs.finishedAt).toBeInstanceOf(Date);
  });

  it("should throw NotFoundException when session not found", async () => {
    workoutSessionsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when session belongs to different tenant", async () => {
    workoutSessionsRepository.findById.mockResolvedValue(undefined);

    await expect(useCase.execute("session-id-1", "other-tenant-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
