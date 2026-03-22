import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { StartWorkoutSessionUseCase } from "../startSession.useCase";

const STUDENT_ID = "4b934366-f093-4510-9a05-c4ead8021e2e";
const WORKOUT_DAY_ID = "7148b62f-b72b-4032-bcff-149df1bdba2b";
const OTHER_WORKOUT_DAY_ID = "a1a1a1a1-b2b2-4c3c-8d4d-e5e5e5e5e5e5";
const SESSION_ID = "3303f20d-3569-4995-87c8-3a934b2f5ac6";
const TENANT_ID = "5de097f1-cba9-4ad9-a97d-fb77c4b8d84c";
const USER_ID = "97de572b-3e87-4fee-acc8-511c4b3a71ed";
const PROGRAM_ID = "2f4b4594-a974-4021-8758-8e1b061f9ced";
const EXECUTION_ID = "11111111-2222-3333-4444-555555555555";

const makeStudent = () => ({
  id: STUDENT_ID,
  tenantId: TENANT_ID,
  userId: USER_ID,
  status: "active",
  phoneNumber: null,
  goal: null,
  observations: null,
  physicalRestrictions: null,
  currentStreak: 0,
  lastWorkoutDate: null,
  totalWorkouts: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "John Doe",
  email: "john@example.com",
});

const makeWorkoutDay = () => ({
  id: WORKOUT_DAY_ID,
  studentProgramId: PROGRAM_ID,
  name: "Treino A",
  description: null,
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  tenantId: TENANT_ID,
});

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

const makeSessionWithExecutions = () => ({
  ...makeSession(),
  exerciseExecutions: [
    {
      id: EXECUTION_ID,
      workoutSessionId: SESSION_ID,
      studentExerciseId: "se-1",
      exerciseId: "ex-1",
      order: 1,
      startedAt: null,
      finishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      exerciseSets: [
        {
          id: "set-1",
          exerciseExecutionId: EXECUTION_ID,
          setNumber: 1,
          plannedReps: 10,
          performedReps: 10,
          plannedWeight: "20",
          usedWeight: "20",
          restSeconds: 60,
          completionStatus: "completed" as const,
          createdAt: new Date(),
        },
      ],
    },
  ],
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeStudent()),
});

const makeWorkoutDaysRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeWorkoutDay()),
});

const makeWorkoutSessionsRepository = () => ({
  create: vi.fn().mockResolvedValue(makeSession()),
  hasActiveSession: vi.fn().mockResolvedValue(false),
  findActiveByStudentAndWorkoutDay: vi.fn().mockResolvedValue(null),
  findByIdWithExecutions: vi.fn().mockResolvedValue(makeSessionWithExecutions()),
});

describe("StartWorkoutSessionUseCase", () => {
  let useCase: StartWorkoutSessionUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let workoutDaysRepository: ReturnType<typeof makeWorkoutDaysRepository>;
  let workoutSessionsRepository: ReturnType<typeof makeWorkoutSessionsRepository>;

  const tenantId = TENANT_ID;

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    workoutDaysRepository = makeWorkoutDaysRepository();
    workoutSessionsRepository = makeWorkoutSessionsRepository();

    useCase = new StartWorkoutSessionUseCase(
      studentsRepository as any,
      workoutDaysRepository as any,
      workoutSessionsRepository as any,
    );
  });

  it("should create a session successfully", async () => {
    const result = await useCase.execute(
      {
        studentId: STUDENT_ID,
        workoutDayId: WORKOUT_DAY_ID,
      },
      tenantId,
    );

    expect(workoutSessionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        studentId: STUDENT_ID,
        workoutDayId: WORKOUT_DAY_ID,
      }),
    );
    expect(result.id).toBe(SESSION_ID);
    expect(result.status).toBe("started");
    expect(result.exerciseExecutions).toEqual([]);
  });

  it("should use provided startedAt when given", async () => {
    const startedAt = new Date("2024-01-01T10:00:00Z");

    await useCase.execute(
      {
        studentId: STUDENT_ID,
        workoutDayId: WORKOUT_DAY_ID,
        startedAt,
      },
      tenantId,
    );

    expect(workoutSessionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ startedAt }),
    );
  });

  it("should use current time if startedAt not provided", async () => {
    const before = new Date();

    await useCase.execute(
      {
        studentId: STUDENT_ID,
        workoutDayId: WORKOUT_DAY_ID,
      },
      tenantId,
    );

    const after = new Date();
    const callArgs = workoutSessionsRepository.create.mock.calls[0][0];
    expect(callArgs.startedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(callArgs.startedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        { studentId: STUDENT_ID, workoutDayId: WORKOUT_DAY_ID },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout day not found", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        { studentId: STUDENT_ID, workoutDayId: WORKOUT_DAY_ID },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when workout day belongs to different tenant", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue({
      ...makeWorkoutDay(),
      tenantId: "02982dc5-ea65-4f0c-ad5b-9b0d49b449c4",
    });

    await expect(
      useCase.execute(
        { studentId: STUDENT_ID, workoutDayId: WORKOUT_DAY_ID },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should return existing active session with executions for the same workoutDayId (idempotent)", async () => {
    workoutSessionsRepository.findActiveByStudentAndWorkoutDay.mockResolvedValue(makeSession());

    const result = await useCase.execute(
      { studentId: STUDENT_ID, workoutDayId: WORKOUT_DAY_ID },
      tenantId,
    );

    expect(workoutSessionsRepository.findActiveByStudentAndWorkoutDay).toHaveBeenCalledWith(
      STUDENT_ID,
      WORKOUT_DAY_ID,
      tenantId,
    );
    expect(workoutSessionsRepository.findByIdWithExecutions).toHaveBeenCalledWith(SESSION_ID, tenantId);
    expect(workoutSessionsRepository.create).not.toHaveBeenCalled();
    expect(result.id).toBe(SESSION_ID);
    expect(result.exerciseExecutions).toHaveLength(1);
    expect(result.exerciseExecutions[0].exerciseSets).toHaveLength(1);
  });

  it("should throw BadRequestException when student has active session for a different workoutDay", async () => {
    workoutDaysRepository.findByIdWithTenant.mockResolvedValue({
      ...makeWorkoutDay(),
      id: OTHER_WORKOUT_DAY_ID,
    });
    workoutSessionsRepository.findActiveByStudentAndWorkoutDay.mockResolvedValue(null);
    workoutSessionsRepository.hasActiveSession.mockResolvedValue(true);

    await expect(
      useCase.execute(
        { studentId: STUDENT_ID, workoutDayId: OTHER_WORKOUT_DAY_ID },
        tenantId,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should not call hasActiveSession when existing session found for same workoutDay", async () => {
    workoutSessionsRepository.findActiveByStudentAndWorkoutDay.mockResolvedValue(makeSession());

    await useCase.execute(
      { studentId: STUDENT_ID, workoutDayId: WORKOUT_DAY_ID },
      tenantId,
    );

    expect(workoutSessionsRepository.hasActiveSession).not.toHaveBeenCalled();
  });

  it("should return paused session with executions when resuming", async () => {
    const pausedSession = { ...makeSession(), status: "paused" as const };
    workoutSessionsRepository.findActiveByStudentAndWorkoutDay.mockResolvedValue(pausedSession);

    const result = await useCase.execute(
      { studentId: STUDENT_ID, workoutDayId: WORKOUT_DAY_ID },
      tenantId,
    );

    expect(workoutSessionsRepository.findByIdWithExecutions).toHaveBeenCalledWith(SESSION_ID, tenantId);
    expect(workoutSessionsRepository.create).not.toHaveBeenCalled();
    expect(result.id).toBe(SESSION_ID);
  });

  it("should return session with empty executions when existing session has no executions", async () => {
    workoutSessionsRepository.findActiveByStudentAndWorkoutDay.mockResolvedValue(makeSession());
    workoutSessionsRepository.findByIdWithExecutions.mockResolvedValue({
      ...makeSession(),
      exerciseExecutions: [],
    });

    const result = await useCase.execute(
      { studentId: STUDENT_ID, workoutDayId: WORKOUT_DAY_ID },
      tenantId,
    );

    expect(result.exerciseExecutions).toEqual([]);
  });

  it("should throw NotFoundException if findByIdWithExecutions returns undefined for existing session", async () => {
    workoutSessionsRepository.findActiveByStudentAndWorkoutDay.mockResolvedValue(makeSession());
    workoutSessionsRepository.findByIdWithExecutions.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        { studentId: STUDENT_ID, workoutDayId: WORKOUT_DAY_ID },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
