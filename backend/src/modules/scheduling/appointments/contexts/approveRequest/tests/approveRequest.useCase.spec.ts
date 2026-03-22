import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";

import { ApproveAppointmentRequestUseCase } from "../approveRequest.useCase";

const REQUEST_ID = "req-id-1";
const TENANT_ID = "tenant-id-1";
const APT_ID = "apt-id-1";
const STUDENT_ID = "student-id-1";

const makeAppointmentRequest = (overrides = {}) => ({
  id: REQUEST_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  requestedDate: new Date("2026-04-06"),
  requestedStartTime: "10:00",
  requestedEndTime: "11:00",
  status: "pending" as const,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeAppointment = (overrides = {}) => ({
  id: APT_ID,
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  appointmentRequestId: REQUEST_ID,
  startAt: new Date("2026-04-06T10:00:00Z"),
  endAt: new Date("2026-04-06T11:00:00Z"),
  appointmentType: "presential" as const,
  status: "scheduled" as const,
  meetingUrl: null,
  location: "Academia",
  notes: null,
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeAppointmentRequestsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeAppointmentRequest()),
  update: vi.fn().mockResolvedValue(makeAppointmentRequest({ status: "approved" })),
});

const makeAppointmentsRepository = () => ({
  create: vi.fn().mockResolvedValue(makeAppointment()),
  findOverlapping: vi.fn().mockResolvedValue([]),
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

const makeDrizzleProvider = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  },
});

describe("ApproveAppointmentRequestUseCase", () => {
  let useCase: ApproveAppointmentRequestUseCase;
  let appointmentRequestsRepository: ReturnType<typeof makeAppointmentRequestsRepository>;
  let appointmentsRepository: ReturnType<typeof makeAppointmentsRepository>;

  beforeEach(() => {
    appointmentRequestsRepository = makeAppointmentRequestsRepository();
    appointmentsRepository = makeAppointmentsRepository();
    useCase = new ApproveAppointmentRequestUseCase(
      appointmentRequestsRepository as any,
      appointmentsRepository as any,
      makeAvailabilityRulesRepository() as any,
      makeAvailabilityExceptionsRepository() as any,
      makeTrainingSchedulesRepository() as any,
      makeTrainingScheduleExceptionsRepository() as any,
      makeDrizzleProvider() as any,
    );
  });

  it("should approve request and create appointment", async () => {
    const result = await useCase.execute(
      REQUEST_ID,
      { appointmentType: "presential", location: "Academia" },
      TENANT_ID,
    );

    expect(result.id).toBe(APT_ID);
    expect(appointmentRequestsRepository.update).toHaveBeenCalledWith(
      REQUEST_ID,
      TENANT_ID,
      expect.objectContaining({ status: "approved" }),
      expect.anything(),
    );
    expect(appointmentsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        appointmentRequestId: REQUEST_ID,
        status: "scheduled",
      }),
      expect.anything(),
    );
  });

  it("should throw NotFoundException when request not found", async () => {
    appointmentRequestsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        REQUEST_ID,
        { appointmentType: "presential", location: "Academia" },
        TENANT_ID,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException for different tenant", async () => {
    appointmentRequestsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        REQUEST_ID,
        { appointmentType: "presential", location: "Academia" },
        "different-tenant",
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when already approved", async () => {
    appointmentRequestsRepository.findById.mockResolvedValue(
      makeAppointmentRequest({ status: "approved" }),
    );

    await expect(
      useCase.execute(
        REQUEST_ID,
        { appointmentType: "presential", location: "Academia" },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw ConflictException when conflicts exist and forceCreate is false", async () => {
    appointmentsRepository.findOverlapping.mockResolvedValue([makeAppointment()]);

    await expect(
      useCase.execute(
        REQUEST_ID,
        { appointmentType: "presential", location: "Academia" },
        TENANT_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should throw BadRequestException when already rejected", async () => {
    appointmentRequestsRepository.findById.mockResolvedValue(
      makeAppointmentRequest({ status: "rejected" }),
    );

    await expect(
      useCase.execute(
        REQUEST_ID,
        { appointmentType: "presential", location: "Academia" },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
