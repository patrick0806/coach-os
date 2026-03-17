import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetCalendarUseCase } from "../getCalendar.useCase";

const TENANT_ID = "tenant-id-1";

const makeAppointmentsRepository = () => ({
  findAllByTenantId: vi.fn().mockResolvedValue({
    rows: [
      {
        id: "apt-1",
        tenantId: TENANT_ID,
        studentId: "student-1",
        startAt: new Date("2026-04-06T10:00:00Z"),
        endAt: new Date("2026-04-06T11:00:00Z"),
        appointmentType: "presential",
        status: "scheduled",
        meetingUrl: null,
        location: "Academia",
        notes: null,
        cancelledAt: null,
        cancellationReason: null,
        appointmentRequestId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        studentName: "John Doe",
        studentEmail: "john@test.com",
      },
    ],
    total: 1,
  }),
});

const makeAvailabilityExceptionsRepository = () => ({
  findByDateRange: vi.fn().mockResolvedValue([
    {
      id: "exc-1",
      tenantId: TENANT_ID,
      exceptionDate: "2026-04-07",
      reason: "Holiday",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
});

const makeTrainingSchedulesRepository = () => ({
  findByTenantId: vi.fn().mockResolvedValue([
    {
      id: "ts-1",
      tenantId: TENANT_ID,
      studentId: "student-1",
      studentProgramId: null,
      dayOfWeek: 1, // Monday
      startTime: "08:00",
      endTime: "09:00",
      location: "Gym A",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue({
    id: "student-1",
    tenantId: TENANT_ID,
    name: "John Doe",
  }),
});

describe("GetCalendarUseCase", () => {
  let useCase: GetCalendarUseCase;

  beforeEach(() => {
    useCase = new GetCalendarUseCase(
      makeAppointmentsRepository() as any,
      makeAvailabilityExceptionsRepository() as any,
      makeTrainingSchedulesRepository() as any,
      makeStudentsRepository() as any,
    );
  });

  it("should return merged calendar entries", async () => {
    const result = await useCase.execute(
      { startDate: "2026-04-06", endDate: "2026-04-07" },
      TENANT_ID,
    );

    const types = result.map((e) => e.type);
    expect(types).toContain("appointment");
    expect(types).toContain("training_schedule");
    expect(types).toContain("exception");
  });

  it("should expand training schedules for matching days in range", async () => {
    const result = await useCase.execute(
      { startDate: "2026-04-06", endDate: "2026-04-13" },
      TENANT_ID,
    );

    const trainingEntries = result.filter((e) => e.type === "training_schedule");
    // 2026-04-06 (Mon) and 2026-04-13 (Mon) = 2 Mondays in range
    expect(trainingEntries).toHaveLength(2);
  });

  it("should include exceptions in the range", async () => {
    const result = await useCase.execute(
      { startDate: "2026-04-06", endDate: "2026-04-07" },
      TENANT_ID,
    );

    const exceptions = result.filter((e) => e.type === "exception");
    expect(exceptions).toHaveLength(1);
    expect(exceptions[0].reason).toBe("Holiday");
  });

  it("should return empty array for range with no events", async () => {
    const emptyUseCase = new GetCalendarUseCase(
      { findAllByTenantId: vi.fn().mockResolvedValue({ rows: [], total: 0 }) } as any,
      { findByDateRange: vi.fn().mockResolvedValue([]) } as any,
      { findByTenantId: vi.fn().mockResolvedValue([]) } as any,
      { findById: vi.fn().mockResolvedValue(null) } as any,
    );

    const result = await emptyUseCase.execute(
      { startDate: "2026-04-06", endDate: "2026-04-07" },
      TENANT_ID,
    );

    expect(result).toEqual([]);
  });

  it("should enforce tenant isolation via repository calls", async () => {
    const appointmentsRepo = makeAppointmentsRepository();
    const exceptionsRepo = makeAvailabilityExceptionsRepository();
    const schedulesRepo = makeTrainingSchedulesRepository();
    const studentsRepo = makeStudentsRepository();

    const tenantUseCase = new GetCalendarUseCase(
      appointmentsRepo as any,
      exceptionsRepo as any,
      schedulesRepo as any,
      studentsRepo as any,
    );

    await tenantUseCase.execute(
      { startDate: "2026-04-06", endDate: "2026-04-07" },
      TENANT_ID,
    );

    expect(appointmentsRepo.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.any(Object),
    );
    expect(exceptionsRepo.findByDateRange).toHaveBeenCalledWith(
      TENANT_ID,
      "2026-04-06",
      "2026-04-07",
    );
    expect(schedulesRepo.findByTenantId).toHaveBeenCalledWith(TENANT_ID, true);
  });
});
