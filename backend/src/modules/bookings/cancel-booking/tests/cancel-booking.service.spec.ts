import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CancelBookingService } from "../cancel-booking.service";

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

describe("CancelBookingService", () => {
  let service: CancelBookingService;
  let bookingsRepository: {
    findById: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    bookingsRepository = {
      findById: vi.fn(),
      cancel: vi.fn(),
    };
    service = new CancelBookingService(bookingsRepository as any);
  });

  describe("execute", () => {
    it("should cancel a booking with a reason", async () => {
      const cancelled = {
        ...mockBooking,
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: "Aluno não compareceu",
      };
      bookingsRepository.findById.mockResolvedValue(mockBooking);
      bookingsRepository.cancel.mockResolvedValue(cancelled);

      const result = await service.execute(
        "booking-id",
        "Aluno não compareceu",
        mockCurrentUser,
      );

      expect(bookingsRepository.findById).toHaveBeenCalledWith("booking-id", "personal-id");
      expect(bookingsRepository.cancel).toHaveBeenCalledWith(
        "booking-id",
        "personal-id",
        "Aluno não compareceu",
      );
      expect(result.status).toBe("cancelled");
    });

    it("should throw NotFoundException when booking not found", async () => {
      bookingsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("other-booking", "Motivo", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when booking is already cancelled", async () => {
      bookingsRepository.findById.mockResolvedValue({
        ...mockBooking,
        status: "cancelled",
        cancelledAt: new Date(),
      });

      await expect(
        service.execute("booking-id", "Motivo", mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when reason is empty", async () => {
      bookingsRepository.findById.mockResolvedValue(mockBooking);

      await expect(
        service.execute("booking-id", "", mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
