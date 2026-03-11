import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { GetBookingService } from "../get-booking.service";

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
  studentName: "Aluno Teste",
  studentEmail: "aluno@teste.com",
  servicePlanName: "Plano Básico",
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

describe("GetBookingService", () => {
  let service: GetBookingService;
  let bookingsRepository: { findById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bookingsRepository = { findById: vi.fn() };
    service = new GetBookingService(bookingsRepository as any);
  });

  describe("execute", () => {
    it("should return a booking by id", async () => {
      bookingsRepository.findById.mockResolvedValue(mockBooking);

      const result = await service.execute("booking-id", mockCurrentUser);

      expect(bookingsRepository.findById).toHaveBeenCalledWith("booking-id", "personal-id");
      expect(result).toEqual(mockBooking);
    });

    it("should throw NotFoundException when booking not found", async () => {
      bookingsRepository.findById.mockResolvedValue(null);

      await expect(service.execute("other-booking", mockCurrentUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
