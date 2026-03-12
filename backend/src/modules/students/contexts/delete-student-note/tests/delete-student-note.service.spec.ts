import { describe, it, expect, beforeEach, vi } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { DeleteStudentNoteService } from "../delete-student-note.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("DeleteStudentNoteService", () => {
  let service: DeleteStudentNoteService;
  let studentNotesRepository: {
    findById: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    studentNotesRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    };
    service = new DeleteStudentNoteService(studentNotesRepository as never);
  });

  it("should delete a note", async () => {
    studentNotesRepository.findById.mockResolvedValue({
      id: "note-id",
      personalId: "personal-id",
    });

    await service.execute("note-id", mockCurrentUser);

    expect(studentNotesRepository.delete).toHaveBeenCalledWith("note-id", "personal-id");
  });

  it("should block deleting another personal's note", async () => {
    studentNotesRepository.findById.mockResolvedValue({
      id: "note-id",
      personalId: "other-personal-id",
    });

    await expect(service.execute("note-id", mockCurrentUser)).rejects.toThrow(ForbiddenException);
  });

  it("should throw NotFoundException when note does not exist", async () => {
    studentNotesRepository.findById.mockResolvedValue(null);

    await expect(service.execute("note-id", mockCurrentUser)).rejects.toThrow(NotFoundException);
  });
});
