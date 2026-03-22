import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";

import { RescheduleAppointmentUseCase } from "../rescheduleAppointment.useCase";

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
  findById: vi.fn().mockResolvedValue(makeAppointment()),
  findOverlapping: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockResolvedValue(makeAppointment({
    startAt: new Date("2026-04-07T14:00:00Z"),
    endAt: new Date("2026-04-07T15:00:00Z"),
  })),
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

describe("RescheduleAppointmentUseCase", () => {
  let useCase: RescheduleAppointmentUseCase;
  let appointmentsRepository: ReturnType<typeof makeAppointmentsRepository>;
  let availabilityRulesRepository: ReturnType<typeof makeAvailabilityRulesRepository>;
  let availabilityExceptionsRepository: ReturnType<typeof makeAvailabilityExceptionsRepository>;
  let trainingSchedulesRepository: ReturnType<typeof makeTrainingSchedulesRepository>;

  beforeEach(() => {
    appointmentsRepository = makeAppointmentsRepository();
    availabilityRulesRepository = makeAvailabilityRulesRepository();
    availabilityExceptionsRepository = makeAvailabilityExceptionsRepository();
    trainingSchedulesRepository = makeTrainingSchedulesRepository();
    useCase = new RescheduleAppointmentUseCase(
      appointmentsRepository as any,
      availabilityRulesRepository as any,
      availabilityExceptionsRepository as any,
      trainingSchedulesRepository as any,
      makeTrainingScheduleExceptionsRepository() as any,
    );
  });

  it("should reschedule an appointment successfully", async () => {
    const result = await useCase.execute(
      APT_ID,
      {
        startAt: new Date("2026-04-07T14:00:00Z"),
        endAt: new Date("2026-04-07T15:00:00Z"),
      },
      TENANT_ID,
    );

    expect(result).toBeDefined();
    expect(appointmentsRepository.update).toHaveBeenCalledWith(
      APT_ID,
      TENANT_ID,
      expect.objectContaining({
        startAt: new Date("2026-04-07T14:00:00Z"),
        endAt: new Date("2026-04-07T15:00:00Z"),
      }),
    );
  });

  it("should throw NotFoundException when appointment not found", async () => {
    appointmentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        "nonexistent",
        {
          startAt: new Date("2026-04-07T14:00:00Z"),
          endAt: new Date("2026-04-07T15:00:00Z"),
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when appointment is cancelled", async () => {
    appointmentsRepository.findById.mockResolvedValue(makeAppointment({ status: "cancelled" }));

    await expect(
      useCase.execute(
        APT_ID,
        {
          startAt: new Date("2026-04-07T14:00:00Z"),
          endAt: new Date("2026-04-07T15:00:00Z"),
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when appointment is completed", async () => {
    appointmentsRepository.findById.mockResolvedValue(makeAppointment({ status: "completed" }));

    await expect(
      useCase.execute(
        APT_ID,
        {
          startAt: new Date("2026-04-07T14:00:00Z"),
          endAt: new Date("2026-04-07T15:00:00Z"),
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when startAt >= endAt", async () => {
    await expect(
      useCase.execute(
        APT_ID,
        {
          startAt: new Date("2026-04-07T15:00:00Z"),
          endAt: new Date("2026-04-07T14:00:00Z"),
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw ConflictException when conflicts detected", async () => {
    appointmentsRepository.findOverlapping.mockResolvedValue([
      makeAppointment({
        id: "other-apt",
        startAt: new Date("2026-04-07T14:00:00Z"),
        endAt: new Date("2026-04-07T15:00:00Z"),
      }),
    ]);

    await expect(
      useCase.execute(
        APT_ID,
        {
          startAt: new Date("2026-04-07T14:00:00Z"),
          endAt: new Date("2026-04-07T15:00:00Z"),
        },
        TENANT_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should allow forceCreate to override conflicts", async () => {
    appointmentsRepository.findOverlapping.mockResolvedValue([
      makeAppointment({ id: "other-apt" }),
    ]);

    const result = await useCase.execute(
      APT_ID,
      {
        startAt: new Date("2026-04-07T14:00:00Z"),
        endAt: new Date("2026-04-07T15:00:00Z"),
        forceCreate: true,
      },
      TENANT_ID,
    );

    expect(result).toBeDefined();
    expect(appointmentsRepository.update).toHaveBeenCalled();
  });

  it("should exclude self from overlap check", async () => {
    await useCase.execute(
      APT_ID,
      {
        startAt: new Date("2026-04-07T14:00:00Z"),
        endAt: new Date("2026-04-07T15:00:00Z"),
      },
      TENANT_ID,
    );

    expect(appointmentsRepository.findOverlapping).toHaveBeenCalledWith(
      TENANT_ID,
      new Date("2026-04-07T14:00:00Z"),
      new Date("2026-04-07T15:00:00Z"),
      APT_ID,
    );
  });

  it("should allow changing appointment type with required fields", async () => {
    await useCase.execute(
      APT_ID,
      {
        startAt: new Date("2026-04-07T14:00:00Z"),
        endAt: new Date("2026-04-07T15:00:00Z"),
        appointmentType: "online",
        meetingUrl: "https://meet.google.com/abc",
      },
      TENANT_ID,
    );

    expect(appointmentsRepository.update).toHaveBeenCalledWith(
      APT_ID,
      TENANT_ID,
      expect.objectContaining({
        appointmentType: "online",
        meetingUrl: "https://meet.google.com/abc",
      }),
    );
  });

  it("should keep original type fields when type is not changed", async () => {
    await useCase.execute(
      APT_ID,
      {
        startAt: new Date("2026-04-07T14:00:00Z"),
        endAt: new Date("2026-04-07T15:00:00Z"),
      },
      TENANT_ID,
    );

    const updateCall = appointmentsRepository.update.mock.calls[0][2];
    expect(updateCall.appointmentType).toBeUndefined();
  });
});
