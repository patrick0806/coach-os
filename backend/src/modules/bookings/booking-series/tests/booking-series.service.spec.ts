import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException, ConflictException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { BookingSeriesService } from "../booking-series.service";

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

const mockSeries = {
  id: "series-id",
  personalId: "personal-id",
  studentId: VALID_STUDENT_UUID,
  servicePlanId: VALID_PLAN_UUID,
  daysOfWeek: [1, 3],
  startTime: "08:00",
  endTime: "09:00",
  seriesStartDate: "2024-01-01",
  seriesEndDate: "2024-01-31",
  notes: null,
  createdAt: new Date("2024-01-01"),
};

const mockCreatedBookings = [
  {
    id: "booking-1",
    personalId: "personal-id",
    studentId: VALID_STUDENT_UUID,
    servicePlanId: VALID_PLAN_UUID,
    seriesId: "series-id",
    scheduledDate: new Date("2024-01-01"),
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
    studentId: VALID_STUDENT_UUID,
    servicePlanId: VALID_PLAN_UUID,
    seriesId: "series-id",
    scheduledDate: new Date("2024-01-03"),
    startTime: "08:00",
    endTime: "09:00",
    notes: null,
    status: "scheduled",
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("BookingSeriesService", () => {
  let service: BookingSeriesService;
  let bookingSeriesRepository: { create: ReturnType<typeof vi.fn> };
  let bookingsRepository: {
    findConflict: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
  };
  let servicePlansRepository: { findOwnedById: ReturnType<typeof vi.fn> };
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };
  let drizzle: {
    db: {
      transaction: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    bookingSeriesRepository = { create: vi.fn().mockResolvedValue(mockSeries) };
    bookingsRepository = {
      findConflict: vi.fn().mockResolvedValue(null),
      createMany: vi.fn().mockResolvedValue(mockCreatedBookings),
    };
    servicePlansRepository = { findOwnedById: vi.fn().mockResolvedValue(mockServicePlan) };
    studentsRepository = { findById: vi.fn().mockResolvedValue(mockStudent) };
    drizzle = {
      db: {
        transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback({})),
      },
    };

    service = new BookingSeriesService(
      bookingSeriesRepository as any,
      bookingsRepository as any,
      servicePlansRepository as any,
      studentsRepository as any,
      drizzle as any,
    );
  });

  it("should create booking series and bookings in a single transaction", async () => {
    const result = await service.execute(
      {
        studentId: VALID_STUDENT_UUID,
        servicePlanId: VALID_PLAN_UUID,
        daysOfWeek: [1, 3],
        startTime: "08:00",
        endTime: "09:00",
        seriesStartDate: "2024-01-01",
        seriesEndDate: "2024-01-07",
      },
      mockCurrentUser,
    );

    expect(studentsRepository.findById).toHaveBeenCalledWith(VALID_STUDENT_UUID, "personal-id");
    expect(servicePlansRepository.findOwnedById).toHaveBeenCalledWith(VALID_PLAN_UUID, "personal-id");
    expect(drizzle.db.transaction).toHaveBeenCalledTimes(1);
    expect(bookingSeriesRepository.create).toHaveBeenCalled();
    expect(bookingsRepository.createMany).toHaveBeenCalled();
    expect(result.bookingsCreated).toBe(2);
    expect(result.series.id).toBe("series-id");
  });

  it("should throw BadRequestException when student does not belong to personal", async () => {
    studentsRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute(
        {
          studentId: VALID_STUDENT_UUID,
          servicePlanId: VALID_PLAN_UUID,
          daysOfWeek: [1],
          startTime: "08:00",
          endTime: "09:00",
          seriesStartDate: "2024-01-01",
          seriesEndDate: "2024-01-07",
        },
        mockCurrentUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when service plan does not belong to personal", async () => {
    servicePlansRepository.findOwnedById.mockResolvedValue(null);

    await expect(
      service.execute(
        {
          studentId: VALID_STUDENT_UUID,
          servicePlanId: VALID_PLAN_UUID,
          daysOfWeek: [1],
          startTime: "08:00",
          endTime: "09:00",
          seriesStartDate: "2024-01-01",
          seriesEndDate: "2024-01-07",
        },
        mockCurrentUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw ConflictException with conflicting dates and reject entire creation", async () => {
    bookingsRepository.findConflict
      .mockResolvedValueOnce({ id: "conflict-1" })
      .mockResolvedValueOnce(null);

    await expect(
      service.execute(
        {
          studentId: VALID_STUDENT_UUID,
          servicePlanId: VALID_PLAN_UUID,
          daysOfWeek: [1, 3],
          startTime: "08:00",
          endTime: "09:00",
          seriesStartDate: "2024-01-01",
          seriesEndDate: "2024-01-07",
        },
        mockCurrentUser,
      ),
    ).rejects.toThrow(ConflictException);

    expect(bookingSeriesRepository.create).not.toHaveBeenCalled();
    expect(bookingsRepository.createMany).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException when recurrence period exceeds 6 months", async () => {
    await expect(
      service.execute(
        {
          studentId: VALID_STUDENT_UUID,
          servicePlanId: VALID_PLAN_UUID,
          daysOfWeek: [1],
          startTime: "08:00",
          endTime: "09:00",
          seriesStartDate: "2024-01-01",
          seriesEndDate: "2024-08-01",
        },
        mockCurrentUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
