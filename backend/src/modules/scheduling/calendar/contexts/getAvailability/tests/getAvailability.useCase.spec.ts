import { describe, it, expect, vi, beforeEach } from "vitest";

import { GetAvailabilityUseCase } from "../getAvailability.useCase";

const mockWorkingHoursRepository = {
  findActiveInDateRange: vi.fn(),
};

const mockRecurringSlotsRepository = {
  findActiveInDateRange: vi.fn(),
};

const mockCalendarEventsRepository = {
  findByDateRange: vi.fn(),
};

describe("GetAvailabilityUseCase", () => {
  let useCase: GetAvailabilityUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetAvailabilityUseCase(
      mockWorkingHoursRepository as any,
      mockRecurringSlotsRepository as any,
      mockCalendarEventsRepository as any,
    );
  });

  it("should return empty when no working hours", async () => {
    mockWorkingHoursRepository.findActiveInDateRange.mockResolvedValue([]);
    mockRecurringSlotsRepository.findActiveInDateRange.mockResolvedValue([]);
    mockCalendarEventsRepository.findByDateRange.mockResolvedValue([]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-06" },
      "tenant-1",
    );

    expect(result).toEqual([]);
  });

  it("should return full working hours when no busy entries", async () => {
    mockWorkingHoursRepository.findActiveInDateRange.mockResolvedValue([
      {
        id: "wh-1",
        tenantId: "tenant-1",
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "12:00",
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockRecurringSlotsRepository.findActiveInDateRange.mockResolvedValue([]);
    mockCalendarEventsRepository.findByDateRange.mockResolvedValue([]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-06" },
      "tenant-1",
    );

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toEqual(new Date("2026-04-06T08:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T12:00:00Z"));
  });

  it("should subtract busy slots from working hours", async () => {
    mockWorkingHoursRepository.findActiveInDateRange.mockResolvedValue([
      {
        id: "wh-1",
        tenantId: "tenant-1",
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "12:00",
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockRecurringSlotsRepository.findActiveInDateRange.mockResolvedValue([
      {
        id: "slot-1",
        tenantId: "tenant-1",
        studentId: "student-1",
        studentProgramId: null,
        type: "booking",
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "10:00",
        location: null,
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockCalendarEventsRepository.findByDateRange.mockResolvedValue([]);

    const result = await useCase.execute(
      { start: "2026-04-06", end: "2026-04-06" },
      "tenant-1",
    );

    expect(result).toHaveLength(2);
    // 08:00-09:00 free, 10:00-12:00 free
    expect(result[0].startAt).toEqual(new Date("2026-04-06T08:00:00Z"));
    expect(result[0].endAt).toEqual(new Date("2026-04-06T09:00:00Z"));
    expect(result[1].startAt).toEqual(new Date("2026-04-06T10:00:00Z"));
    expect(result[1].endAt).toEqual(new Date("2026-04-06T12:00:00Z"));
  });

  it("should throw validation error for invalid date format", async () => {
    await expect(
      useCase.execute({ start: "bad", end: "2026-04-06" }, "tenant-1"),
    ).rejects.toThrow();
  });
});
