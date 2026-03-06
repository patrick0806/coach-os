import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, ConflictException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateBookingService } from "../create-booking.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "student-id",
};

const mockServicePlan = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Plano Básico",
  description: null,
  sessionsPerWeek: 3,
  durationMinutes: 60,
  price: "299.90",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
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

describe("CreateBookingService", () => {
  let service: CreateBookingService;
  let bookingsRepository: {
    findConflict: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let servicePlansRepository: { findById: ReturnType<typeof vi.fn> };
  let resendProvider: {
    sendBookingConfirmation: ReturnType<typeof vi.fn>;
    sendBookingNotification: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    bookingsRepository = {
      findConflict: vi.fn(),
      create: vi.fn(),
    };
    servicePlansRepository = { findById: vi.fn() };
    resendProvider = {
      sendBookingConfirmation: vi.fn(),
      sendBookingNotification: vi.fn(),
    };
    service = new CreateBookingService(
      bookingsRepository as any,
      servicePlansRepository as any,
      resendProvider as any,
    );
  });

  describe("execute", () => {
    it("should create a booking successfully", async () => {
      servicePlansRepository.findById.mockResolvedValue(mockServicePlan);
      bookingsRepository.findConflict.mockResolvedValue(null);
      bookingsRepository.create.mockResolvedValue(mockBooking);
      resendProvider.sendBookingConfirmation.mockResolvedValue(undefined);
      resendProvider.sendBookingNotification.mockResolvedValue(undefined);

      const result = await service.execute(
        {
          servicePlanId: "plan-id",
          scheduledDate: "2024-01-15",
          startTime: "08:00",
          endTime: "09:00",
        },
        mockCurrentUser,
      );

      expect(servicePlansRepository.findById).toHaveBeenCalledWith("plan-id");
      expect(bookingsRepository.findConflict).toHaveBeenCalledWith(
        "personal-id",
        "2024-01-15",
        "08:00",
      );
      expect(bookingsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          personalId: "personal-id",
          studentId: "student-id",
          servicePlanId: "plan-id",
          startTime: "08:00",
          endTime: "09:00",
        }),
      );
      expect(result).toEqual(mockBooking);
    });

    it("should throw BadRequestException when service plan does not belong to personal", async () => {
      servicePlansRepository.findById.mockResolvedValue({
        ...mockServicePlan,
        personalId: "other-personal",
      });

      await expect(
        service.execute(
          { servicePlanId: "plan-id", scheduledDate: "2024-01-15", startTime: "08:00", endTime: "09:00" },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when service plan not found", async () => {
      servicePlansRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute(
          { servicePlanId: "plan-id", scheduledDate: "2024-01-15", startTime: "08:00", endTime: "09:00" },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException when time slot is already booked", async () => {
      servicePlansRepository.findById.mockResolvedValue(mockServicePlan);
      bookingsRepository.findConflict.mockResolvedValue({ id: "existing-booking" });

      await expect(
        service.execute(
          { servicePlanId: "plan-id", scheduledDate: "2024-01-15", startTime: "08:00", endTime: "09:00" },
          mockCurrentUser,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw BadRequestException when input is invalid", async () => {
      await expect(
        service.execute(
          { servicePlanId: "", scheduledDate: "2024-01-15", startTime: "08:00", endTime: "09:00" },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
