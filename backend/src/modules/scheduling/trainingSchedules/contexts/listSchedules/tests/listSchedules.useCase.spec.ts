import { describe, it, expect, beforeEach, vi } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { ListTrainingSchedulesUseCase } from "../listSchedules.useCase";
import { ApplicationRoles } from "@shared/enums";

const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeSchedule = (overrides = {}) => ({
  id: "schedule-id",
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
  findByStudentId: vi.fn().mockResolvedValue([makeSchedule(), makeSchedule({ id: "schedule-2", dayOfWeek: 3 })]),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

describe("ListTrainingSchedulesUseCase", () => {
  let useCase: ListTrainingSchedulesUseCase;
  let trainingSchedulesRepository: ReturnType<typeof makeTrainingSchedulesRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;

  beforeEach(() => {
    trainingSchedulesRepository = makeTrainingSchedulesRepository();
    studentsRepository = makeStudentsRepository();
    useCase = new ListTrainingSchedulesUseCase(
      trainingSchedulesRepository as any,
      studentsRepository as any,
    );
  });

  const personalUser = {
    role: ApplicationRoles.PERSONAL,
    profileId: "personal-profile-id",
  };

  const studentUser = {
    role: ApplicationRoles.STUDENT,
    profileId: STUDENT_ID,
  };

  it("should return training schedules for a student (coach request)", async () => {
    const result = await useCase.execute(STUDENT_ID, TENANT_ID, personalUser);

    expect(result).toHaveLength(2);
    expect(trainingSchedulesRepository.findByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      true,
    );
  });

  it("should return training schedules when student requests their own", async () => {
    const result = await useCase.execute(STUDENT_ID, TENANT_ID, studentUser);

    expect(result).toHaveLength(2);
  });

  it("should throw ForbiddenException when student requests another student's schedules", async () => {
    const otherStudentUser = {
      role: ApplicationRoles.STUDENT,
      profileId: "other-student-id",
    };

    await expect(
      useCase.execute(STUDENT_ID, TENANT_ID, otherStudentUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should return empty array when no schedules exist", async () => {
    trainingSchedulesRepository.findByStudentId.mockResolvedValue([]);

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, personalUser);

    expect(result).toEqual([]);
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(STUDENT_ID, TENANT_ID, personalUser),
    ).rejects.toThrow(NotFoundException);
  });

  it("should enforce tenant isolation via student lookup", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID, personalUser);

    expect(studentsRepository.findById).toHaveBeenCalledWith(STUDENT_ID, TENANT_ID);
  });
});
