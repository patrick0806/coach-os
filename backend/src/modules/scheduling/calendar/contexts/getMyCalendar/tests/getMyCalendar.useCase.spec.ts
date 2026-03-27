import { describe, it, expect, vi, beforeEach } from "vitest";

import { GetMyCalendarUseCase } from "../getMyCalendar.useCase";

const mockRecurringSlotsRepository = {
  findByStudentId: vi.fn(),
};

const mockCalendarEventsRepository = {
  findByStudentAndDateRange: vi.fn(),
};

const STUDENT_ID = "student-1";
const TENANT_ID = "tenant-1";

describe("GetMyCalendarUseCase", () => {
  let useCase: GetMyCalendarUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetMyCalendarUseCase(
      mockRecurringSlotsRepository as any,
      mockCalendarEventsRepository as any,
    );
  });

  it("should return empty array when student has no slots or events", async () => {
    mockRecurringSlotsRepository.findByStudentId.mockResolvedValue([]);
    mockCalendarEventsRepository.findByStudentAndDateRange.mockResolvedValue([]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-12" },
      STUDENT_ID,
      TENANT_ID,
    );

    expect(result).toEqual([]);
    expect(mockRecurringSlotsRepository.findByStudentId).toHaveBeenCalledWith(
      STUDENT_ID,
      TENANT_ID,
      true,
    );
  });

  it("should expand recurring slot into instances within date range", async () => {
    // dayOfWeek 0 = Sunday; 2026-04-12 is a Sunday
    mockRecurringSlotsRepository.findByStudentId.mockResolvedValue([
      {
        id: "slot-1",
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        studentProgramId: null,
        type: "booking",
        dayOfWeek: 0,
        startTime: "09:00",
        endTime: "10:00",
        location: "Gym",
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockCalendarEventsRepository.findByStudentAndDateRange.mockResolvedValue([]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-12" },
      STUDENT_ID,
      TENANT_ID,
    );

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2026-04-12T09:00:00Z"));
    expect(result[0].source).toBe("recurring_slot");
    expect(result[0].type).toBe("booking");
  });

  it("should merge recurring instances with one_off events", async () => {
    mockRecurringSlotsRepository.findByStudentId.mockResolvedValue([
      {
        id: "slot-1",
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        studentProgramId: null,
        type: "booking",
        dayOfWeek: 1, // Monday; 2026-04-06 is a Monday
        startTime: "10:00",
        endTime: "11:00",
        location: null,
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockCalendarEventsRepository.findByStudentAndDateRange.mockResolvedValue([
      {
        id: "event-1",
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        startAt: new Date("2026-04-08T14:00:00Z"),
        endAt: new Date("2026-04-08T15:00:00Z"),
        type: "one_off",
        recurringSlotId: null,
        originalStartAt: null,
        status: "scheduled",
        appointmentType: "online",
        meetingUrl: "https://meet.example.com",
        location: null,
        notes: null,
        cancelledAt: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        studentName: "Ana",
        studentEmail: "ana@test.com",
      },
    ]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-12" },
      STUDENT_ID,
      TENANT_ID,
    );

    expect(result).toHaveLength(2);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T10:00:00Z"));
    expect(result[0].source).toBe("recurring_slot");
    expect(result[1].startAt).toEqual(new Date("2026-04-08T14:00:00Z"));
    expect(result[1].source).toBe("calendar_event");
  });

  it("should cancel a recurring instance when override is cancelled", async () => {
    const instanceStartAt = new Date("2026-04-07T10:00:00Z"); // Tuesday

    mockRecurringSlotsRepository.findByStudentId.mockResolvedValue([
      {
        id: "slot-1",
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        studentProgramId: null,
        type: "booking",
        dayOfWeek: 2, // Tuesday
        startTime: "10:00",
        endTime: "11:00",
        location: null,
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockCalendarEventsRepository.findByStudentAndDateRange.mockResolvedValue([
      {
        id: "override-1",
        tenantId: TENANT_ID,
        studentId: STUDENT_ID,
        startAt: instanceStartAt,
        endAt: new Date("2026-04-07T11:00:00Z"),
        type: "override",
        recurringSlotId: "slot-1",
        originalStartAt: instanceStartAt,
        status: "cancelled",
        appointmentType: null,
        meetingUrl: null,
        location: null,
        notes: null,
        cancelledAt: new Date(),
        cancellationReason: "Feriado",
        createdAt: new Date(),
        updatedAt: new Date(),
        studentName: null,
        studentEmail: null,
      },
    ]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-12" },
      STUDENT_ID,
      TENANT_ID,
    );

    expect(result).toHaveLength(0);
  });

  it("should throw validation error for invalid date format", async () => {
    await expect(
      useCase.execute({ start: "not-a-date", end: "2026-04-12" }, STUDENT_ID, TENANT_ID),
    ).rejects.toThrow();
  });
});
