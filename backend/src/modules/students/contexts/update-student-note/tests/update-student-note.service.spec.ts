import { describe, it, expect, beforeEach, vi } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateStudentNoteService } from "../update-student-note.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("UpdateStudentNoteService", () => {
  let service: UpdateStudentNoteService;
  let studentNotesRepository: {
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    studentNotesRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    };
    service = new UpdateStudentNoteService(studentNotesRepository as never);
  });

  it("should update a note", async () => {
    const existing = {
      id: "note-id",
      studentId: "student-id",
      personalId: "personal-id",
      note: "Antiga",
      createdAt: new Date("2026-03-11T10:00:00Z"),
      updatedAt: new Date("2026-03-11T10:00:00Z"),
    };
    const updated = { ...existing, note: "Nova nota" };

    studentNotesRepository.findById.mockResolvedValue(existing);
    studentNotesRepository.update.mockResolvedValue(updated);

    const result = await service.execute("note-id", { note: "Nova nota" }, mockCurrentUser);

    expect(studentNotesRepository.update).toHaveBeenCalledWith("note-id", "Nova nota", "personal-id");
    expect(result).toEqual(updated);
  });

  it("should block updating another personal's note", async () => {
    studentNotesRepository.findById.mockResolvedValue({
      id: "note-id",
      personalId: "other-personal-id",
    });

    await expect(
      service.execute("note-id", { note: "Nova nota" }, mockCurrentUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should throw NotFoundException when note does not exist", async () => {
    studentNotesRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute("note-id", { note: "Nova nota" }, mockCurrentUser),
    ).rejects.toThrow(NotFoundException);
  });
});
