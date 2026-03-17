import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { CreateTrainingScheduleUseCase } from "../createSchedule.useCase";

const SCHEDULE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";
const PROGRAM_ID = "d4e5f6a7-b890-1234-cdef-567890abcdef";

const makeSchedule = (overrides = {}) => ({
  id: SCHEDULE_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
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

const makeTrainingSchedulesRepository = () => ({
  create: vi.fn().mockResolvedValue(makeSchedule()),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

const makeStudentProgramsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: PROGRAM_ID, tenantId: TENANT_ID }),
});

describe("CreateTrainingScheduleUseCase", () => {
  let useCase: CreateTrainingScheduleUseCase;
  let trainingSchedulesRepository: ReturnType<typeof makeTrainingSchedulesRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let studentProgramsRepository: ReturnType<typeof makeStudentProgramsRepository>;

  beforeEach(() => {
    trainingSchedulesRepository = makeTrainingSchedulesRepository();
    studentsRepository = makeStudentsRepository();
    studentProgramsRepository = makeStudentProgramsRepository();
    useCase = new CreateTrainingScheduleUseCase(
      trainingSchedulesRepository as any,
      studentsRepository as any,
      studentProgramsRepository as any,
    );
  });

  it("should create a training schedule successfully", async () => {
    const result = await useCase.execute(
      STUDENT_ID,
      { dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
      TENANT_ID,
    );

    expect(result.id).toBe(SCHEDULE_ID);
    expect(trainingSchedulesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
      }),
    );
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        STUDENT_ID,
        { dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should enforce tenant isolation via student lookup", async () => {
    await useCase.execute(
      STUDENT_ID,
      { dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
      TENANT_ID,
    );

    expect(studentsRepository.findById).toHaveBeenCalledWith(STUDENT_ID, TENANT_ID);
  });

  it("should throw validation error when startTime >= endTime", async () => {
    await expect(
      useCase.execute(
        STUDENT_ID,
        { dayOfWeek: 1, startTime: "12:00", endTime: "10:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should throw NotFoundException when studentProgramId is invalid", async () => {
    studentProgramsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        STUDENT_ID,
        {
          dayOfWeek: 1,
          startTime: "10:00",
          endTime: "11:00",
          studentProgramId: PROGRAM_ID,
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should create with studentProgramId when provided", async () => {
    trainingSchedulesRepository.create.mockResolvedValue(
      makeSchedule({ studentProgramId: PROGRAM_ID }),
    );

    const result = await useCase.execute(
      STUDENT_ID,
      {
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
        studentProgramId: PROGRAM_ID,
      },
      TENANT_ID,
    );

    expect(result.studentProgramId).toBe(PROGRAM_ID);
    expect(trainingSchedulesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentProgramId: PROGRAM_ID }),
    );
  });
});
