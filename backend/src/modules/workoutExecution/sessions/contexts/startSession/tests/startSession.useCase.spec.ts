import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { StartWorkoutSessionUseCase } from "../startSession.useCase";

const STUDENT_ID = "4b934366-f093-4510-9a05-c4ead8021e2e";
const WORKOUT_DAY_ID = "7148b62f-b72b-4032-bcff-149df1bdba2b";
const SESSION_ID = "3303f20d-3569-4995-87c8-3a934b2f5ac6";
const TENANT_ID = "5de097f1-cba9-4ad9-a97d-fb77c4b8d84c";
const USER_ID = "97de572b-3e87-4fee-acc8-511c4b3a71ed";
const PROGRAM_ID = "2f4b4594-a974-4021-8758-8e1b061f9ced";

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

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeStudent()),
});

const makeWorkoutDaysRepository = () => ({
  findByIdWithTenant: vi.fn().mockResolvedValue(makeWorkoutDay()),
});

const makeWorkoutSessionsRepository = () => ({
  create: vi.fn().mockResolvedValue(makeSession()),
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
});
