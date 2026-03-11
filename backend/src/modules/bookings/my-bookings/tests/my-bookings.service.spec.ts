import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { MyBookingsService } from "../my-bookings.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "student-id",
};

const mockPaginatedBookings = {
  content: [
    {
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
    },
  ],
  page: 1,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

describe("MyBookingsService", () => {
  let service: MyBookingsService;
  let bookingsRepository: { findByStudent: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bookingsRepository = { findByStudent: vi.fn() };
    service = new MyBookingsService(bookingsRepository as any);
  });

  describe("execute", () => {
    it("should return paginated bookings for the authenticated student", async () => {
      bookingsRepository.findByStudent.mockResolvedValue(mockPaginatedBookings);

      const result = await service.execute({ page: 1, size: 10 }, mockCurrentUser);

      expect(bookingsRepository.findByStudent).toHaveBeenCalledWith("student-id", "personal-id", {
        page: 1,
        size: 10,
      });
      expect(result).toEqual(mockPaginatedBookings);
    });

    it("should return empty content when student has no bookings", async () => {
      bookingsRepository.findByStudent.mockResolvedValue({
        content: [],
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      });

      const result = await service.execute({ page: 1, size: 10 }, mockCurrentUser);

      expect(result.content).toEqual([]);
      expect(result.totalElements).toBe(0);
    });
  });
});
