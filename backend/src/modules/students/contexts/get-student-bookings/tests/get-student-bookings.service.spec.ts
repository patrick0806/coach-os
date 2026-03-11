import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { GetStudentBookingsService } from "../get-student-bookings.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("GetStudentBookingsService", () => {
  let service: GetStudentBookingsService;
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };
  let bookingsRepository: { findByStudent: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepository = { findById: vi.fn() };
    bookingsRepository = { findByStudent: vi.fn() };

    service = new GetStudentBookingsService(
      studentsRepository as never,
      bookingsRepository as never,
    );
  });

  it("should return bookings for the student", async () => {
    const paginated = {
      content: [],
      page: 1,
      size: 100,
      totalElements: 0,
      totalPages: 0,
    };

    studentsRepository.findById.mockResolvedValue({ id: "student-id" });
    bookingsRepository.findByStudent.mockResolvedValue(paginated);

    const result = await service.execute("student-id", mockCurrentUser);

    expect(studentsRepository.findById).toHaveBeenCalledWith("student-id", "personal-id");
    expect(bookingsRepository.findByStudent).toHaveBeenCalledWith(
      "student-id",
      "personal-id",
      { page: 1, size: 100 },
    );
    expect(result).toEqual(paginated);
  });

  it("should throw NotFoundException when student does not exist", async () => {
    studentsRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute("student-id", mockCurrentUser),
    ).rejects.toThrow(NotFoundException);
  });
});
