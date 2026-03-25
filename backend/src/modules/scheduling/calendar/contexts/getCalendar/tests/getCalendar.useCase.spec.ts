import { describe, it, expect, vi, beforeEach } from "vitest";

import { GetCalendarUseCase } from "../getCalendar.useCase";

const mockRecurringSlotsRepository = {
  findActiveInDateRange: vi.fn(),
};

const mockCalendarEventsRepository = {
  findByDateRange: vi.fn(),
};

const mockStudentsRepository = {
  findByIds: vi.fn(),
};

describe("GetCalendarUseCase", () => {
  let useCase: GetCalendarUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetCalendarUseCase(
      mockRecurringSlotsRepository as any,
      mockCalendarEventsRepository as any,
      mockStudentsRepository as any,
    );
  });

  it("should return empty array when no slots or events", async () => {
    mockRecurringSlotsRepository.findActiveInDateRange.mockResolvedValue([]);
    mockCalendarEventsRepository.findByDateRange.mockResolvedValue([]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-12" },
      "tenant-1",
    );

    expect(result).toEqual([]);
  });

  it("should expand recurring slots and merge with events", async () => {
    mockRecurringSlotsRepository.findActiveInDateRange.mockResolvedValue([
      {
        id: "slot-1",
        tenantId: "tenant-1",
        studentId: "student-1",
        studentProgramId: null,
        type: "booking",
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
        location: "Gym",
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockCalendarEventsRepository.findByDateRange.mockResolvedValue([
      {
        id: "event-1",
        tenantId: "tenant-1",
        studentId: "student-1",
        startAt: new Date("2026-04-06T14:00:00Z"),
        endAt: new Date("2026-04-06T15:00:00Z"),
        type: "one_off",
        recurringSlotId: null,
        originalStartAt: null,
        status: "scheduled",
        appointmentType: "presential",
        meetingUrl: null,
        location: "Office",
        notes: null,
        cancelledAt: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        studentName: "João",
        studentEmail: "joao@test.com",
      },
    ]);
    mockStudentsRepository.findByIds.mockResolvedValue([
      { id: "student-1", name: "João" },
    ]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-12" },
      "tenant-1",
    );

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T10:00:00Z"));
    expect(result[1].startAt).toEqual(new Date("2026-04-06T14:00:00Z"));
  });

  it("should throw validation error for invalid date format", async () => {
    await expect(
      useCase.execute({ start: "invalid", end: "2026-04-12" }, "tenant-1"),
    ).rejects.toThrow();
  });

  it("should handle empty studentIds without calling findByIds", async () => {
    mockRecurringSlotsRepository.findActiveInDateRange.mockResolvedValue([
      {
        id: "slot-1",
        tenantId: "tenant-1",
        studentId: null,
        studentProgramId: null,
        type: "block",
        dayOfWeek: 1,
        startTime: "12:00",
        endTime: "13:00",
        location: null,
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockCalendarEventsRepository.findByDateRange.mockResolvedValue([]);

    await useCase.execute(
      { start: "2026-04-06", end: "2026-04-12" },
      "tenant-1",
    );

    expect(mockStudentsRepository.findByIds).not.toHaveBeenCalled();
  });
});
