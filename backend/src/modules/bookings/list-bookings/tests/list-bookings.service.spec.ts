import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListBookingsService } from "../list-bookings.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPaginated = {
  content: [
    {
      id: "booking-1",
      personalId: "personal-id",
      studentId: "student-id",
      servicePlanId: "plan-id",
      studentName: "Aluno Teste",
      studentEmail: "aluno@teste.com",
      servicePlanName: "Plano Básico",
      seriesId: "series-id",
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
    {
      id: "booking-2",
      personalId: "personal-id",
      studentId: "student-id",
      servicePlanId: "plan-id",
      studentName: "Aluno Teste",
      studentEmail: "aluno@teste.com",
      servicePlanName: "Plano Básico",
      seriesId: null,
      scheduledDate: new Date("2024-01-16"),
      startTime: "10:00",
      endTime: "11:00",
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
  totalElements: 2,
  totalPages: 1,
};

describe("ListBookingsService", () => {
  let service: ListBookingsService;
  let bookingsRepository: { findByPersonal: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bookingsRepository = { findByPersonal: vi.fn() };
    service = new ListBookingsService(bookingsRepository as any);
  });

  describe("execute", () => {
    it("should return paginated bookings for the personal", async () => {
      bookingsRepository.findByPersonal.mockResolvedValue(mockPaginated);

      const result = await service.execute({}, mockCurrentUser);

      expect(bookingsRepository.findByPersonal).toHaveBeenCalledWith(
        "personal-id",
        expect.objectContaining({ page: 1, size: 10 }),
      );
      expect(result.content[0]).toMatchObject({ seriesId: "series-id", isRecurring: true });
      expect(result.content[1]).toMatchObject({ seriesId: null, isRecurring: false });
    });

    it("should pass status filter when provided", async () => {
      bookingsRepository.findByPersonal.mockResolvedValue(mockPaginated);

      await service.execute(
        { status: "scheduled", from: "2024-01-01", to: "2024-01-31", page: 2, size: 5 },
        mockCurrentUser,
      );

      expect(bookingsRepository.findByPersonal).toHaveBeenCalledWith(
        "personal-id",
        expect.objectContaining({
          status: "scheduled",
          page: 2,
          size: 5,
          from: new Date("2024-01-01T00:00:00Z"),
          to: new Date("2024-01-31T23:59:59Z"),
        }),
      );
    });
  });
});
