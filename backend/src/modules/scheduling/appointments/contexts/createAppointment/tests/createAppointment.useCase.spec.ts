import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, ConflictException } from "@nestjs/common";

import { CreateAppointmentUseCase } from "../createAppointment.useCase";

const APT_ID = "apt-id-1";
const STUDENT_ID = "student-id-1";
const TENANT_ID = "tenant-id-1";

const makeAppointment = (overrides = {}) => ({
  id: APT_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  appointmentRequestId: null,
  startAt: new Date("2026-04-06T10:00:00Z"),
  endAt: new Date("2026-04-06T11:00:00Z"),
  appointmentType: "presential" as const,
  status: "scheduled" as const,
  meetingUrl: null,
  location: "Academia XYZ",
  notes: null,
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeAppointmentsRepository = () => ({
  create: vi.fn().mockResolvedValue(makeAppointment()),
  findOverlapping: vi.fn().mockResolvedValue([]),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_ID }),
});

const makeAvailabilityRulesRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([]),
});

const makeAvailabilityExceptionsRepository = () => ({
  findByDateRange: vi.fn().mockResolvedValue([]),
});

const makeTrainingSchedulesRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([]),
});

const makeTrainingScheduleExceptionsRepository = () => ({
  findByScheduleIdsAndDateRange: vi.fn().mockResolvedValue([]),
});

describe("CreateAppointmentUseCase", () => {
  let useCase: CreateAppointmentUseCase;
  let appointmentsRepository: ReturnType<typeof makeAppointmentsRepository>;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let availabilityRulesRepository: ReturnType<typeof makeAvailabilityRulesRepository>;
  let availabilityExceptionsRepository: ReturnType<typeof makeAvailabilityExceptionsRepository>;
  let trainingSchedulesRepository: ReturnType<typeof makeTrainingSchedulesRepository>;

  beforeEach(() => {
    appointmentsRepository = makeAppointmentsRepository();
    studentsRepository = makeStudentsRepository();
    availabilityRulesRepository = makeAvailabilityRulesRepository();
    availabilityExceptionsRepository = makeAvailabilityExceptionsRepository();
    trainingSchedulesRepository = makeTrainingSchedulesRepository();
    useCase = new CreateAppointmentUseCase(
      appointmentsRepository as any,
      studentsRepository as any,
      availabilityRulesRepository as any,
      availabilityExceptionsRepository as any,
      trainingSchedulesRepository as any,
      makeTrainingScheduleExceptionsRepository() as any,
    );
  });

  it("should create an appointment successfully", async () => {
    const result = await useCase.execute(
      {
        studentId: STUDENT_ID,
        startAt: new Date("2026-04-06T10:00:00Z"),
        endAt: new Date("2026-04-06T11:00:00Z"),
        appointmentType: "presential",
        location: "Academia XYZ",
      },
      TENANT_ID,
    );

    expect(result.id).toBe(APT_ID);
    expect(appointmentsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        status: "scheduled",
      }),
    );
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        {
          studentId: STUDENT_ID,
          startAt: new Date("2026-04-06T10:00:00Z"),
          endAt: new Date("2026-04-06T11:00:00Z"),
          appointmentType: "presential",
          location: "Academia",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw ConflictException when appointment overlaps", async () => {
    appointmentsRepository.findOverlapping.mockResolvedValue([makeAppointment()]);

    await expect(
      useCase.execute(
        {
          studentId: STUDENT_ID,
          startAt: new Date("2026-04-06T10:00:00Z"),
          endAt: new Date("2026-04-06T11:00:00Z"),
          appointmentType: "presential",
          location: "Academia",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should throw ConflictException when conflicts with training schedule", async () => {
    trainingSchedulesRepository.findByTenantId.mockResolvedValue([
      {
        id: "ts-1",
        tenantId: TENANT_ID,
        studentId: "other-student",
        studentProgramId: null,
        dayOfWeek: 1, // Monday = 2026-04-06
        startTime: "10:00",
        endTime: "11:00",
        location: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await expect(
      useCase.execute(
        {
          studentId: STUDENT_ID,
          startAt: new Date("2026-04-06T10:00:00Z"),
          endAt: new Date("2026-04-06T11:00:00Z"),
          appointmentType: "presential",
          location: "Academia",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should allow forceCreate to override conflicts", async () => {
    appointmentsRepository.findOverlapping.mockResolvedValue([makeAppointment()]);

    const result = await useCase.execute(
      {
        studentId: STUDENT_ID,
        startAt: new Date("2026-04-06T10:00:00Z"),
        endAt: new Date("2026-04-06T11:00:00Z"),
        appointmentType: "presential",
        location: "Academia",
        forceCreate: true,
      },
      TENANT_ID,
    );

    expect(result.id).toBe(APT_ID);
  });

  it("should require meetingUrl for online appointments", async () => {
    await expect(
      useCase.execute(
        {
          studentId: STUDENT_ID,
          startAt: new Date("2026-04-06T10:00:00Z"),
          endAt: new Date("2026-04-06T11:00:00Z"),
          appointmentType: "online",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });

  it("should require location for presential appointments", async () => {
    await expect(
      useCase.execute(
        {
          studentId: STUDENT_ID,
          startAt: new Date("2026-04-06T10:00:00Z"),
          endAt: new Date("2026-04-06T11:00:00Z"),
          appointmentType: "presential",
        },
        TENANT_ID,
      ),
    ).rejects.toThrow();
  });
});
