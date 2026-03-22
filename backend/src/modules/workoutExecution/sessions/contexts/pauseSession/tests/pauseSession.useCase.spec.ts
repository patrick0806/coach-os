import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { PauseWorkoutSessionUseCase } from "../pauseSession.useCase";

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
  update: vi.fn().mockResolvedValue({ ...makeSession(), status: "paused" as const }),
});

describe("PauseWorkoutSessionUseCase", () => {
  let useCase: PauseWorkoutSessionUseCase;
  let workoutSessionsRepository: ReturnType<typeof makeWorkoutSessionsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    workoutSessionsRepository = makeWorkoutSessionsRepository();
    useCase = new PauseWorkoutSessionUseCase(workoutSessionsRepository as any);
  });

  it("should pause a session successfully", async () => {
    const result = await useCase.execute("session-id-1", tenantId);

    expect(workoutSessionsRepository.update).toHaveBeenCalledWith(
      "session-id-1",
      tenantId,
      { status: "paused" },
    );
    expect(result.status).toBe("paused");
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

  it("should return the updated session", async () => {
    const result = await useCase.execute("session-id-1", tenantId);

    expect(result.id).toBe("session-id-1");
    expect(result.status).toBe("paused");
  });

  it("should throw BadRequestException when session is already paused", async () => {
    workoutSessionsRepository.findById.mockResolvedValue({ ...makeSession(), status: "paused" as const });

    await expect(useCase.execute("session-id-1", tenantId)).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when session is finished", async () => {
    workoutSessionsRepository.findById.mockResolvedValue({ ...makeSession(), status: "finished" as const });

    await expect(useCase.execute("session-id-1", tenantId)).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when session is skipped", async () => {
    workoutSessionsRepository.findById.mockResolvedValue({ ...makeSession(), status: "skipped" as const });

    await expect(useCase.execute("session-id-1", tenantId)).rejects.toThrow(BadRequestException);
  });
});
