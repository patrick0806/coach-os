import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateStudentService } from "../update-student.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockStudent = {
  id: "student-id",
  userId: "student-user-id",
  personalId: "personal-id",
  name: "Alice Silva",
  email: "alice@example.com",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("UpdateStudentService", () => {
  let service: UpdateStudentService;
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };
  let usersRepository: { update: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepository = { findById: vi.fn() };
    usersRepository = { update: vi.fn() };
    service = new UpdateStudentService(
      studentsRepository as any,
      usersRepository as any,
    );
  });

  describe("execute", () => {
    it("should update student name successfully", async () => {
      studentsRepository.findById.mockResolvedValue(mockStudent);
      usersRepository.update.mockResolvedValue({
        ...mockStudent,
        name: "Alice Santos",
      });
      studentsRepository.findById.mockResolvedValueOnce(mockStudent);

      // Second call after update should return updated data
      studentsRepository.findById
        .mockResolvedValueOnce(mockStudent)
        .mockResolvedValueOnce({ ...mockStudent, name: "Alice Santos" });

      const result = await service.execute(
        "student-id",
        { name: "Alice Santos" },
        mockCurrentUser,
      );

      expect(studentsRepository.findById).toHaveBeenCalledWith(
        "student-id",
        "personal-id",
      );
      expect(usersRepository.update).toHaveBeenCalledWith(
        mockStudent.userId,
        { name: "Alice Santos" },
      );
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException when student does not exist in tenant", async () => {
      studentsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("unknown-id", { name: "Alice" }, mockCurrentUser),
      ).rejects.toThrow(NotFoundException);

      expect(usersRepository.update).not.toHaveBeenCalled();
    });
  });
});
