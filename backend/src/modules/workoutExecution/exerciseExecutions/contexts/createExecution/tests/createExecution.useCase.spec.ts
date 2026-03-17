import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { CreateExerciseExecutionUseCase } from "../createExecution.useCase";

const SESSION_ID = "4b934366-f093-4510-9a05-c4ead8021e2e";
const STUDENT_EXERCISE_ID = "7148b62f-b72b-4032-bcff-149df1bdba2b";
const EXERCISE_ID = "3303f20d-3569-4995-87c8-3a934b2f5ac6";
const EXECUTION_ID = "5de097f1-cba9-4ad9-a97d-fb77c4b8d84c";
const TENANT_ID = "97de572b-3e87-4fee-acc8-511c4b3a71ed";
const STUDENT_ID = "2f4b4594-a974-4021-8758-8e1b061f9ced";
const WORKOUT_DAY_ID = "02982dc5-ea65-4f0c-ad5b-9b0d49b449c4";

const makeSession = () => ({
  id: SESSION_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  workoutDayId: WORKOUT_DAY_ID,
  status: "started" as const,
  startedAt: new Date(),
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeExecution = () => ({
  id: EXECUTION_ID,
  workoutSessionId: SESSION_ID,
  studentExerciseId: STUDENT_EXERCISE_ID,
  exerciseId: EXERCISE_ID,
  order: 1,
  startedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutSessionsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeSession()),
});

const makeExerciseExecutionsRepository = () => ({
  create: vi.fn().mockResolvedValue(makeExecution()),
  findMaxOrderBySessionId: vi.fn().mockResolvedValue(0),
});

describe("CreateExerciseExecutionUseCase", () => {
  let useCase: CreateExerciseExecutionUseCase;
  let workoutSessionsRepository: ReturnType<typeof makeWorkoutSessionsRepository>;
  let exerciseExecutionsRepository: ReturnType<typeof makeExerciseExecutionsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    workoutSessionsRepository = makeWorkoutSessionsRepository();
    exerciseExecutionsRepository = makeExerciseExecutionsRepository();

    useCase = new CreateExerciseExecutionUseCase(
      workoutSessionsRepository as any,
      exerciseExecutionsRepository as any,
    );
  });

  it("should create an execution with provided order", async () => {
    const result = await useCase.execute(
      {
        workoutSessionId: SESSION_ID,
        studentExerciseId: STUDENT_EXERCISE_ID,
        exerciseId: EXERCISE_ID,
        order: 2,
      },
      tenantId,
    );

    expect(exerciseExecutionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        workoutSessionId: SESSION_ID,
        studentExerciseId: STUDENT_EXERCISE_ID,
        exerciseId: EXERCISE_ID,
        order: 2,
      }),
    );
    expect(result.id).toBe(EXECUTION_ID);
  });

  it("should auto-compute order when not provided", async () => {
    exerciseExecutionsRepository.findMaxOrderBySessionId.mockResolvedValue(3);

    await useCase.execute(
      {
        workoutSessionId: SESSION_ID,
        studentExerciseId: STUDENT_EXERCISE_ID,
        exerciseId: EXERCISE_ID,
      },
      tenantId,
    );

    expect(exerciseExecutionsRepository.findMaxOrderBySessionId).toHaveBeenCalledWith(
      SESSION_ID,
    );
    expect(exerciseExecutionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ order: 4 }),
    );
  });

  it("should use order 1 when no executions exist yet", async () => {
    exerciseExecutionsRepository.findMaxOrderBySessionId.mockResolvedValue(0);

    await useCase.execute(
      {
        workoutSessionId: SESSION_ID,
        studentExerciseId: STUDENT_EXERCISE_ID,
        exerciseId: EXERCISE_ID,
      },
      tenantId,
    );

    expect(exerciseExecutionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ order: 1 }),
    );
  });

  it("should throw NotFoundException when session not found", async () => {
    workoutSessionsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        {
          workoutSessionId: SESSION_ID,
          studentExerciseId: STUDENT_EXERCISE_ID,
          exerciseId: EXERCISE_ID,
        },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when session belongs to different tenant", async () => {
    workoutSessionsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        {
          workoutSessionId: SESSION_ID,
          studentExerciseId: STUDENT_EXERCISE_ID,
          exerciseId: EXERCISE_ID,
        },
        "8af884ac-ee2e-4075-9e51-40a5a8b48cd1",
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should not call findMaxOrder when order is provided", async () => {
    await useCase.execute(
      {
        workoutSessionId: SESSION_ID,
        studentExerciseId: STUDENT_EXERCISE_ID,
        exerciseId: EXERCISE_ID,
        order: 1,
      },
      tenantId,
    );

    expect(exerciseExecutionsRepository.findMaxOrderBySessionId).not.toHaveBeenCalled();
  });
});
