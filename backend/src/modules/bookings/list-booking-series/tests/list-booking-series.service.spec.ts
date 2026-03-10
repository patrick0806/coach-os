import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListBookingSeriesService } from "../list-booking-series.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("ListBookingSeriesService", () => {
  let service: ListBookingSeriesService;
  let bookingSeriesRepository: { findActiveByPersonal: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bookingSeriesRepository = {
      findActiveByPersonal: vi.fn(),
    };
    service = new ListBookingSeriesService(bookingSeriesRepository as any);
  });

  it("should list active booking series for personal", async () => {
    const mockSeries = [
      {
        id: "series-id",
        personalId: "personal-id",
        studentId: "student-id",
        servicePlanId: "plan-id",
        daysOfWeek: [1, 3, 5],
        startTime: "08:00",
        endTime: "09:00",
        seriesStartDate: "2024-01-01",
        seriesEndDate: "2024-03-31",
        notes: null,
        createdAt: new Date("2024-01-01"),
      },
    ];
    bookingSeriesRepository.findActiveByPersonal.mockResolvedValue(mockSeries);

    const result = await service.execute(mockCurrentUser);

    expect(bookingSeriesRepository.findActiveByPersonal).toHaveBeenCalledWith("personal-id");
    expect(result).toEqual(mockSeries);
  });
});
