import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, ConflictException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreatePersonalBookingService } from "../create-personal-booking.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const VALID_STUDENT_UUID = "550e8400-e29b-41d4-a716-446655440001";
const VALID_PLAN_UUID = "550e8400-e29b-41d4-a716-446655440000";

const mockStudent = {
  id: VALID_STUDENT_UUID,
  userId: "student-user-id",
  personalId: "personal-id",
  name: "Aluno Teste",
  email: "aluno@teste.com",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockServicePlan = {
  id: VALID_PLAN_UUID,
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
  studentId: VALID_STUDENT_UUID,
  servicePlanId: VALID_PLAN_UUID,
  seriesId: null,
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

describe("CreatePersonalBookingService", () => {
  let service: CreatePersonalBookingService;
  let bookingsRepository: {
    findConflict: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let servicePlansRepository: { findOwnedById: ReturnType<typeof vi.fn> };
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bookingsRepository = {
      findConflict: vi.fn(),
      create: vi.fn(),
    };
    servicePlansRepository = {
      findOwnedById: vi.fn(),
    };
    studentsRepository = {
      findById: vi.fn(),
    };

    service = new CreatePersonalBookingService(
      bookingsRepository as any,
      servicePlansRepository as any,
      studentsRepository as any,
    );
  });

  describe("execute", () => {
    it("should create booking when student and service plan belong to personal", async () => {
      studentsRepository.findById.mockResolvedValue(mockStudent);
      servicePlansRepository.findOwnedById.mockResolvedValue(mockServicePlan);
      bookingsRepository.findConflict.mockResolvedValue(null);
      bookingsRepository.create.mockResolvedValue(mockBooking);

      const result = await service.execute(
        {
          studentId: VALID_STUDENT_UUID,
          servicePlanId: VALID_PLAN_UUID,
          scheduledDate: "2024-01-15",
          startTime: "08:00",
          endTime: "09:00",
        },
        mockCurrentUser,
      );

      expect(studentsRepository.findById).toHaveBeenCalledWith(VALID_STUDENT_UUID, "personal-id");
      expect(servicePlansRepository.findOwnedById).toHaveBeenCalledWith(VALID_PLAN_UUID, "personal-id");
      expect(bookingsRepository.findConflict).toHaveBeenCalledWith(
        "personal-id",
        "2024-01-15",
        "08:00",
      );
      expect(bookingsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          personalId: "personal-id",
          studentId: VALID_STUDENT_UUID,
          servicePlanId: VALID_PLAN_UUID,
          startTime: "08:00",
          endTime: "09:00",
        }),
      );
      expect(result).toEqual(mockBooking);
    });

    it("should throw BadRequestException when student does not belong to personal", async () => {
      studentsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute(
          {
            studentId: VALID_STUDENT_UUID,
            servicePlanId: VALID_PLAN_UUID,
            scheduledDate: "2024-01-15",
            startTime: "08:00",
            endTime: "09:00",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when service plan does not belong to personal", async () => {
      studentsRepository.findById.mockResolvedValue(mockStudent);
      servicePlansRepository.findOwnedById.mockResolvedValue(null);

      await expect(
        service.execute(
          {
            studentId: VALID_STUDENT_UUID,
            servicePlanId: VALID_PLAN_UUID,
            scheduledDate: "2024-01-15",
            startTime: "08:00",
            endTime: "09:00",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException when there is conflict at the same time", async () => {
      studentsRepository.findById.mockResolvedValue(mockStudent);
      servicePlansRepository.findOwnedById.mockResolvedValue(mockServicePlan);
      bookingsRepository.findConflict.mockResolvedValue({ id: "existing-booking" });

      await expect(
        service.execute(
          {
            studentId: VALID_STUDENT_UUID,
            servicePlanId: VALID_PLAN_UUID,
            scheduledDate: "2024-01-15",
            startTime: "08:00",
            endTime: "09:00",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw BadRequestException when payload is invalid", async () => {
      await expect(
        service.execute(
          {
            studentId: "x",
            servicePlanId: VALID_PLAN_UUID,
            scheduledDate: "2024-01-15",
            startTime: "08:00",
            endTime: "09:00",
          } as any,
          mockCurrentUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
