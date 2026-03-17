import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { RecordExerciseSetUseCase } from "../recordSet.useCase";

const EXECUTION_ID = "4b934366-f093-4510-9a05-c4ead8021e2e";
const SESSION_ID = "7148b62f-b72b-4032-bcff-149df1bdba2b";
const STUDENT_EXERCISE_ID = "3303f20d-3569-4995-87c8-3a934b2f5ac6";
const EXERCISE_ID = "5de097f1-cba9-4ad9-a97d-fb77c4b8d84c";
const SET_ID = "97de572b-3e87-4fee-acc8-511c4b3a71ed";
const TENANT_ID = "2f4b4594-a974-4021-8758-8e1b061f9ced";

const makeExecutionWithTenant = () => ({
  id: EXECUTION_ID,
  workoutSessionId: SESSION_ID,
  studentExerciseId: STUDENT_EXERCISE_ID,
  exerciseId: EXERCISE_ID,
  order: 1,
  startedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  tenantId: TENANT_ID,
});

const makeExerciseSet = () => ({
  id: SET_ID,
  exerciseExecutionId: EXECUTION_ID,
  setNumber: 1,
  plannedReps: 10,
  performedReps: 10,
  plannedWeight: "50.00",
  usedWeight: "50.00",
  restSeconds: 60,
  completionStatus: "completed" as const,
  createdAt: new Date(),
});

const makeExerciseExecutionsRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeExecutionWithTenant()),
});

const makeExerciseSetsRepository = () => ({
  create: vi.fn().mockResolvedValue(makeExerciseSet()),
});

describe("RecordExerciseSetUseCase", () => {
  let useCase: RecordExerciseSetUseCase;
  let exerciseExecutionsRepository: ReturnType<typeof makeExerciseExecutionsRepository>;
  let exerciseSetsRepository: ReturnType<typeof makeExerciseSetsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    exerciseExecutionsRepository = makeExerciseExecutionsRepository();
    exerciseSetsRepository = makeExerciseSetsRepository();

    useCase = new RecordExerciseSetUseCase(
      exerciseExecutionsRepository as any,
      exerciseSetsRepository as any,
    );
  });

  it("should record a set successfully", async () => {
    const result = await useCase.execute(
      {
        exerciseExecutionId: EXECUTION_ID,
        setNumber: 1,
        plannedReps: 10,
        performedReps: 10,
        plannedWeight: 50,
        usedWeight: 50,
        restSeconds: 60,
        completionStatus: "completed",
      },
      tenantId,
    );

    expect(exerciseSetsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseExecutionId: EXECUTION_ID,
        setNumber: 1,
        completionStatus: "completed",
      }),
    );
    expect(result.id).toBe(SET_ID);
  });

  it("should convert weight numbers to strings", async () => {
    await useCase.execute(
      {
        exerciseExecutionId: EXECUTION_ID,
        setNumber: 1,
        plannedWeight: 50.5,
        usedWeight: 50.5,
        completionStatus: "completed",
      },
      tenantId,
    );

    expect(exerciseSetsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        plannedWeight: "50.5",
        usedWeight: "50.5",
      }),
    );
  });

  it("should allow optional fields to be omitted", async () => {
    await useCase.execute(
      {
        exerciseExecutionId: EXECUTION_ID,
        setNumber: 1,
        completionStatus: "skipped",
      },
      tenantId,
    );

    expect(exerciseSetsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        completionStatus: "skipped",
      }),
    );
  });

  it("should throw NotFoundException when execution not found", async () => {
    exerciseExecutionsRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        {
          exerciseExecutionId: EXECUTION_ID,
          setNumber: 1,
          completionStatus: "completed",
        },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when execution belongs to different tenant", async () => {
    exerciseExecutionsRepository.findByIdWithTenant.mockResolvedValue({
      ...makeExecutionWithTenant(),
      tenantId: "02982dc5-ea65-4f0c-ad5b-9b0d49b449c4",
    });

    await expect(
      useCase.execute(
        {
          exerciseExecutionId: EXECUTION_ID,
          setNumber: 1,
          completionStatus: "completed",
        },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should record a partial set", async () => {
    exerciseSetsRepository.create.mockResolvedValue({
      ...makeExerciseSet(),
      completionStatus: "partial" as const,
      performedReps: 7,
    });

    const result = await useCase.execute(
      {
        exerciseExecutionId: EXECUTION_ID,
        setNumber: 1,
        plannedReps: 10,
        performedReps: 7,
        completionStatus: "partial",
      },
      tenantId,
    );

    expect(result.completionStatus).toBe("partial");
  });
});
