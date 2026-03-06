import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { GetStudentService } from "../get-student.service";

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

describe("GetStudentService", () => {
  let service: GetStudentService;
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepository = { findById: vi.fn() };
    service = new GetStudentService(studentsRepository as any);
  });

  describe("execute", () => {
    it("should return the student when found in the tenant", async () => {
      studentsRepository.findById.mockResolvedValue(mockStudent);

      const result = await service.execute("student-id", mockCurrentUser);

      expect(result).toEqual(mockStudent);
      expect(studentsRepository.findById).toHaveBeenCalledWith(
        "student-id",
        "personal-id",
      );
    });

    it("should throw NotFoundException when student does not exist", async () => {
      studentsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("unknown-id", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException when student belongs to another tenant (cross-tenant isolation)", async () => {
      studentsRepository.findById.mockResolvedValue(null);

      const otherPersonal = { ...mockCurrentUser, personalId: "other-personal-id" };

      await expect(
        service.execute("student-id", otherPersonal),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
