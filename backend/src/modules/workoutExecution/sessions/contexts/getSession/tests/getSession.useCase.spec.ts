import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { GetWorkoutSessionUseCase } from "../getSession.useCase";

const makeSessionWithExecutions = () => ({
  id: "session-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  workoutDayId: "workout-day-id-1",
  status: "started" as const,
  startedAt: new Date(),
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  exerciseExecutions: [
    {
      id: "execution-id-1",
      workoutSessionId: "session-id-1",
      studentExerciseId: "student-exercise-id-1",
      exerciseId: "exercise-id-1",
      order: 1,
      startedAt: null,
      finishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      exerciseSets: [
        {
          id: "set-id-1",
          exerciseExecutionId: "execution-id-1",
          setNumber: 1,
          plannedReps: 10,
          performedReps: 10,
          plannedWeight: "50.00",
          usedWeight: "50.00",
          restSeconds: 60,
          completionStatus: "completed" as const,
          createdAt: new Date(),
        },
      ],
    },
  ],
});

const makeWorkoutSessionsRepository = () => ({
  findByIdWithExecutions: vi.fn().mockResolvedValue(makeSessionWithExecutions()),
});

describe("GetWorkoutSessionUseCase", () => {
  let useCase: GetWorkoutSessionUseCase;
  let workoutSessionsRepository: ReturnType<typeof makeWorkoutSessionsRepository>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    workoutSessionsRepository = makeWorkoutSessionsRepository();
    useCase = new GetWorkoutSessionUseCase(workoutSessionsRepository as any);
  });

  it("should return session with executions and sets", async () => {
    const result = await useCase.execute("session-id-1", tenantId);

    expect(result.id).toBe("session-id-1");
    expect(result.exerciseExecutions).toHaveLength(1);
    expect(result.exerciseExecutions[0].exerciseSets).toHaveLength(1);
  });

  it("should return session with empty executions", async () => {
    workoutSessionsRepository.findByIdWithExecutions.mockResolvedValue({
      ...makeSessionWithExecutions(),
      exerciseExecutions: [],
    });

    const result = await useCase.execute("session-id-1", tenantId);

    expect(result.exerciseExecutions).toHaveLength(0);
  });

  it("should throw NotFoundException when session not found", async () => {
    workoutSessionsRepository.findByIdWithExecutions.mockResolvedValue(undefined);

    await expect(useCase.execute("nonexistent", tenantId)).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when session belongs to different tenant", async () => {
    workoutSessionsRepository.findByIdWithExecutions.mockResolvedValue(undefined);

    await expect(useCase.execute("session-id-1", "other-tenant-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
