import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";

import { RescheduleOccurrenceUseCase } from "../rescheduleOccurrence.useCase";

const TENANT_ID = "tenant-001";
const SCHEDULE_ID = "schedule-001";

const makeSchedule = (overrides = {}) => ({
  id: SCHEDULE_ID,
  tenantId: TENANT_ID,
  studentId: "student-001",
  dayOfWeek: 1, // Monday
  startTime: "09:00",
  endTime: "10:00",
  location: "Gym A",
  isActive: true,
  ...overrides,
});

const makeTrainingSchedulesRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeSchedule()),
  findByTenantId: vi.fn().mockResolvedValue([makeSchedule()]),
});

const makeExceptionsRepository = () => ({
  findByScheduleAndOriginalDate: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockImplementation((data) => Promise.resolve({ id: "exc-001", ...data })),
});

const makeAvailabilityRulesRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([]),
});

const makeAvailabilityExceptionsRepository = () => ({
  findByDateRange: vi.fn().mockResolvedValue([]),
});

const makeAppointmentsRepository = () => ({
  findOverlapping: vi.fn().mockResolvedValue([]),
});

describe("RescheduleOccurrenceUseCase", () => {
  let useCase: RescheduleOccurrenceUseCase;
  let trainingSchedulesRepository: ReturnType<typeof makeTrainingSchedulesRepository>;
  let exceptionsRepository: ReturnType<typeof makeExceptionsRepository>;
  let availabilityRulesRepository: ReturnType<typeof makeAvailabilityRulesRepository>;
  let availabilityExceptionsRepository: ReturnType<typeof makeAvailabilityExceptionsRepository>;
  let appointmentsRepository: ReturnType<typeof makeAppointmentsRepository>;

  beforeEach(() => {
    trainingSchedulesRepository = makeTrainingSchedulesRepository();
    exceptionsRepository = makeExceptionsRepository();
    availabilityRulesRepository = makeAvailabilityRulesRepository();
    availabilityExceptionsRepository = makeAvailabilityExceptionsRepository();
    appointmentsRepository = makeAppointmentsRepository();
    useCase = new RescheduleOccurrenceUseCase(
      trainingSchedulesRepository as any,
      exceptionsRepository as any,
      availabilityRulesRepository as any,
      availabilityExceptionsRepository as any,
      appointmentsRepository as any,
    );
  });

  it("should reschedule a training occurrence successfully", async () => {
    // Monday 2026-03-23 -> Wednesday 2026-03-25 (same week)
    const result = await useCase.execute(
      SCHEDULE_ID,
      {
        originalDate: "2026-03-23",
        newDate: "2026-03-25",
        newStartTime: "14:00",
        newEndTime: "15:00",
      },
      TENANT_ID,
    );

    expect(result).toHaveProperty("id");
    expect(result.action).toBe("reschedule");
    expect(exceptionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        trainingScheduleId: SCHEDULE_ID,
        tenantId: TENANT_ID,
        originalDate: "2026-03-23",
        action: "reschedule",
        newDate: "2026-03-25",
        newStartTime: "14:00",
        newEndTime: "15:00",
      }),
    );
  });

  it("should throw NotFoundException when schedule not found", async () => {
    trainingSchedulesRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        "nonexistent",
        { originalDate: "2026-03-23", newDate: "2026-03-25", newStartTime: "14:00", newEndTime: "15:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when originalDate does not match dayOfWeek", async () => {
    // 2026-03-25 is a Wednesday (dayOfWeek=3), schedule is Monday (dayOfWeek=1)
    await expect(
      useCase.execute(
        SCHEDULE_ID,
        { originalDate: "2026-03-25", newDate: "2026-03-26", newStartTime: "14:00", newEndTime: "15:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw ConflictException when exception already exists for same date", async () => {
    exceptionsRepository.findByScheduleAndOriginalDate.mockResolvedValue({
      id: "existing-exc",
    });

    await expect(
      useCase.execute(
        SCHEDULE_ID,
        { originalDate: "2026-03-23", newDate: "2026-03-25", newStartTime: "14:00", newEndTime: "15:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should throw BadRequestException when newStartTime >= newEndTime", async () => {
    await expect(
      useCase.execute(
        SCHEDULE_ID,
        { originalDate: "2026-03-23", newDate: "2026-03-25", newStartTime: "15:00", newEndTime: "14:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when newDate is not in same week", async () => {
    // 2026-03-23 is Monday, 2026-03-30 is next Monday — different week
    await expect(
      useCase.execute(
        SCHEDULE_ID,
        { originalDate: "2026-03-23", newDate: "2026-03-30", newStartTime: "14:00", newEndTime: "15:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw ConflictException when conflicts exist and forceCreate is false", async () => {
    appointmentsRepository.findOverlapping.mockResolvedValue([
      { id: "apt-1", startAt: new Date("2026-03-25T14:00:00Z"), endAt: new Date("2026-03-25T15:00:00Z") },
    ]);

    await expect(
      useCase.execute(
        SCHEDULE_ID,
        { originalDate: "2026-03-23", newDate: "2026-03-25", newStartTime: "14:00", newEndTime: "15:00" },
        TENANT_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should allow reschedule with forceCreate when conflicts exist", async () => {
    appointmentsRepository.findOverlapping.mockResolvedValue([
      { id: "apt-1", startAt: new Date("2026-03-25T14:00:00Z"), endAt: new Date("2026-03-25T15:00:00Z") },
    ]);

    const result = await useCase.execute(
      SCHEDULE_ID,
      {
        originalDate: "2026-03-23",
        newDate: "2026-03-25",
        newStartTime: "14:00",
        newEndTime: "15:00",
        forceCreate: true,
      },
      TENANT_ID,
    );

    expect(result).toHaveProperty("id");
  });

  it("should pass newLocation and reason when provided", async () => {
    await useCase.execute(
      SCHEDULE_ID,
      {
        originalDate: "2026-03-23",
        newDate: "2026-03-25",
        newStartTime: "14:00",
        newEndTime: "15:00",
        newLocation: "Gym B",
        reason: "Aluno pediu troca",
      },
      TENANT_ID,
    );

    expect(exceptionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        newLocation: "Gym B",
        reason: "Aluno pediu troca",
      }),
    );
  });
});
