import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateBookingStatusService } from "../update-booking-status.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockBooking = {
  id: "booking-id",
  personalId: "personal-id",
  studentId: "student-id",
  servicePlanId: "plan-id",
  scheduledDate: new Date("2024-01-15"),
  startTime: "08:00",
  endTime: "09:00",
  notes: null,
  status: "scheduled",
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("UpdateBookingStatusService", () => {
  let service: UpdateBookingStatusService;
  let bookingsRepository: {
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    bookingsRepository = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };
    service = new UpdateBookingStatusService(bookingsRepository as any);
  });

  describe("execute", () => {
    it("should update status to completed", async () => {
      const updated = { ...mockBooking, status: "completed" };
      bookingsRepository.findById.mockResolvedValue(mockBooking);
      bookingsRepository.updateStatus.mockResolvedValue(updated);

      const result = await service.execute("booking-id", "completed", mockCurrentUser);

      expect(bookingsRepository.findById).toHaveBeenCalledWith("booking-id", "personal-id");
      expect(bookingsRepository.updateStatus).toHaveBeenCalledWith(
        "booking-id",
        "personal-id",
        "completed",
      );
      expect(result.status).toBe("completed");
    });

    it("should update status to no-show", async () => {
      const updated = { ...mockBooking, status: "no-show" };
      bookingsRepository.findById.mockResolvedValue(mockBooking);
      bookingsRepository.updateStatus.mockResolvedValue(updated);

      const result = await service.execute("booking-id", "no-show", mockCurrentUser);

      expect(result.status).toBe("no-show");
    });

    it("should throw NotFoundException when booking not found", async () => {
      bookingsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("other-booking", "completed", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when booking is already cancelled", async () => {
      bookingsRepository.findById.mockResolvedValue({
        ...mockBooking,
        status: "cancelled",
        cancelledAt: new Date(),
      });

      await expect(
        service.execute("booking-id", "completed", mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for invalid status", async () => {
      bookingsRepository.findById.mockResolvedValue(mockBooking);

      await expect(
        service.execute("booking-id", "invalid-status", mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
