import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { BookingSeriesController } from "../booking-series.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("BookingSeriesController", () => {
  let controller: BookingSeriesController;
  let bookingSeriesService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bookingSeriesService = { execute: vi.fn() };
    controller = new BookingSeriesController(bookingSeriesService as any);
  });

  it("should call service and return created series response", async () => {
    const dto = {
      studentId: "550e8400-e29b-41d4-a716-446655440001",
      servicePlanId: "550e8400-e29b-41d4-a716-446655440000",
      daysOfWeek: [1, 3, 5],
      startTime: "08:00",
      endTime: "09:00",
      seriesStartDate: "2024-01-01",
      seriesEndDate: "2024-01-31",
    };
    const response = {
      series: { id: "series-id" },
      bookingsCreated: 4,
      bookings: [],
    };
    bookingSeriesService.execute.mockResolvedValue(response);

    const result = await controller.handle(dto, mockCurrentUser);

    expect(bookingSeriesService.execute).toHaveBeenCalledWith(dto, mockCurrentUser);
    expect(result).toEqual(response);
  });
});
