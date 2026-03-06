import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { DeactivateStudentService } from "../deactivate-student.service";

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

describe("DeactivateStudentService", () => {
  let service: DeactivateStudentService;
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };
  let usersRepository: { update: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepository = { findById: vi.fn() };
    usersRepository = { update: vi.fn() };
    service = new DeactivateStudentService(
      studentsRepository as any,
      usersRepository as any,
    );
  });

  describe("execute", () => {
    it("should deactivate the student successfully", async () => {
      studentsRepository.findById.mockResolvedValue(mockStudent);
      usersRepository.update.mockResolvedValue(undefined);

      await service.execute("student-id", mockCurrentUser);

      expect(studentsRepository.findById).toHaveBeenCalledWith(
        "student-id",
        "personal-id",
      );
      expect(usersRepository.update).toHaveBeenCalledWith(
        mockStudent.userId,
        { isActive: false },
      );
    });

    it("should throw NotFoundException when student does not exist in tenant", async () => {
      studentsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("unknown-id", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);

      expect(usersRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException for cross-tenant access attempt", async () => {
      studentsRepository.findById.mockResolvedValue(null);

      const otherPersonal = { ...mockCurrentUser, personalId: "attacker-id" };

      await expect(
        service.execute("student-id", otherPersonal),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
