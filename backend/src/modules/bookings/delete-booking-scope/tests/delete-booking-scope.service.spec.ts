import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { DeleteBookingScopeService } from "../delete-booking-scope.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const baseBooking = {
  id: "booking-id",
  personalId: "personal-id",
  studentId: "student-id",
  servicePlanId: "plan-id",
  seriesId: "series-id",
  scheduledDate: new Date("2024-01-15T00:00:00.000Z"),
  startTime: "08:00",
  endTime: "09:00",
  notes: null,
  status: "scheduled",
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("DeleteBookingScopeService", () => {
  let service: DeleteBookingScopeService;
  let bookingsRepository: {
    findById: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    findFutureBySeries: ReturnType<typeof vi.fn>;
    findBySeries: ReturnType<typeof vi.fn>;
    cancelMany: ReturnType<typeof vi.fn>;
    countOpenBySeries: ReturnType<typeof vi.fn>;
  };
  let bookingSeriesRepository: { delete: ReturnType<typeof vi.fn> };
  let drizzle: {
    db: {
      transaction: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    bookingsRepository = {
      findById: vi.fn().mockResolvedValue(baseBooking),
      cancel: vi.fn().mockResolvedValue({ ...baseBooking, status: "cancelled" }),
      findFutureBySeries: vi.fn().mockResolvedValue([baseBooking]),
      findBySeries: vi.fn().mockResolvedValue([baseBooking]),
      cancelMany: vi.fn().mockResolvedValue([{ ...baseBooking, status: "cancelled" }]),
      countOpenBySeries: vi.fn().mockResolvedValue(0),
    };
    bookingSeriesRepository = {
      delete: vi.fn(),
    };
    drizzle = {
      db: {
        transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({})),
      },
    };

    service = new DeleteBookingScopeService(
      bookingsRepository as any,
      bookingSeriesRepository as any,
      drizzle as any,
    );
  });

  it("should cancel single booking", async () => {
    const result = await service.execute("booking-id", { scope: "single" }, mockCurrentUser);

    expect(bookingsRepository.cancel).toHaveBeenCalledWith(
      "booking-id",
      "personal-id",
      "Cancelado pelo personal",
    );
    expect(result).toEqual({
      scope: "single",
      cancelledBookings: 1,
      seriesCancelled: false,
    });
  });

  it("should throw NotFoundException when booking does not exist", async () => {
    bookingsRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute("missing-id", { scope: "single" }, mockCurrentUser),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException when trying to delete completed booking in single scope", async () => {
    bookingsRepository.findById.mockResolvedValue({ ...baseBooking, status: "completed" });

    await expect(
      service.execute("booking-id", { scope: "single" }, mockCurrentUser),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when scope is future/all and booking has no series", async () => {
    bookingsRepository.findById.mockResolvedValue({ ...baseBooking, seriesId: null });

    await expect(
      service.execute("booking-id", { scope: "future" }, mockCurrentUser),
    ).rejects.toThrow(BadRequestException);
  });

  it("should cancel future bookings and end series when there are no open bookings left", async () => {
    const result = await service.execute("booking-id", { scope: "future" }, mockCurrentUser);

    expect(drizzle.db.transaction).toHaveBeenCalledTimes(1);
    expect(bookingsRepository.findFutureBySeries).toHaveBeenCalledWith(
      "series-id",
      "personal-id",
      baseBooking.scheduledDate,
      {},
    );
    expect(bookingsRepository.cancelMany).toHaveBeenCalled();
    expect(bookingSeriesRepository.delete).toHaveBeenCalledWith("series-id", {});
    expect(result).toEqual({
      scope: "future",
      cancelledBookings: 1,
      seriesCancelled: true,
    });
  });

  it("should keep series when there are open bookings remaining", async () => {
    bookingsRepository.countOpenBySeries.mockResolvedValue(2);

    const result = await service.execute("booking-id", { scope: "all" }, mockCurrentUser);

    expect(bookingsRepository.findBySeries).toHaveBeenCalledWith("series-id", "personal-id", {});
    expect(bookingSeriesRepository.delete).not.toHaveBeenCalled();
    expect(result).toEqual({
      scope: "all",
      cancelledBookings: 1,
      seriesCancelled: false,
    });
  });
});
