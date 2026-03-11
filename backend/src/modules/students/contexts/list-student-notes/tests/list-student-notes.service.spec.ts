import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { ListStudentNotesService } from "../list-student-notes.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("ListStudentNotesService", () => {
  let service: ListStudentNotesService;
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };
  let studentNotesRepository: { findByStudentId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepository = { findById: vi.fn() };
    studentNotesRepository = { findByStudentId: vi.fn() };

    service = new ListStudentNotesService(
      studentsRepository as never,
      studentNotesRepository as never,
    );
  });

  it("should list notes ordered by most recent first", async () => {
    const paginated = {
      items: [
        {
          id: "note-2",
          studentId: "student-id",
          personalId: "personal-id",
          note: "Mais recente",
          createdAt: new Date("2026-03-11T10:00:00Z"),
          updatedAt: new Date("2026-03-11T10:00:00Z"),
        },
      ],
      page: 1,
      size: 10,
      total: 1,
    };

    studentsRepository.findById.mockResolvedValue({ id: "student-id" });
    studentNotesRepository.findByStudentId.mockResolvedValue(paginated);

    const result = await service.execute("student-id", { page: 1, size: 10 }, mockCurrentUser);

    expect(studentNotesRepository.findByStudentId).toHaveBeenCalledWith(
      "student-id",
      "personal-id",
      { page: 1, size: 10 },
    );
    expect(result).toEqual(paginated);
  });

  it("should throw NotFoundException when student does not exist", async () => {
    studentsRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute("student-id", { page: 1, size: 10 }, mockCurrentUser),
    ).rejects.toThrow(NotFoundException);
  });
});
