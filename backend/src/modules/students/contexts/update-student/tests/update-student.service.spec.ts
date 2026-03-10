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
  servicePlanId: "service-plan-id",
  servicePlanName: "Plano 3x por semana",
  name: "Alice Silva",
  email: "alice@example.com",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockServicePlan = {
  id: "service-plan-id-2",
  personalId: "personal-id",
  name: "Consultoria online",
  description: null,
  sessionsPerWeek: 1,
  durationMinutes: 60,
  price: "199.90",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("UpdateStudentService", () => {
  let service: UpdateStudentService;
  let studentsRepository: { findById: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let usersRepository: { update: ReturnType<typeof vi.fn> };
  let servicePlansRepository: { findOwnedById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepository = { findById: vi.fn(), update: vi.fn() };
    usersRepository = { update: vi.fn() };
    servicePlansRepository = { findOwnedById: vi.fn() };
    service = new UpdateStudentService(
      studentsRepository as any,
      usersRepository as any,
      servicePlansRepository as any,
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

    it("should update student service plan successfully", async () => {
      studentsRepository.findById
        .mockResolvedValueOnce(mockStudent)
        .mockResolvedValueOnce({
          ...mockStudent,
          servicePlanId: "service-plan-id-2",
          servicePlanName: "Consultoria online",
        });
      servicePlansRepository.findOwnedById.mockResolvedValue(mockServicePlan);
      studentsRepository.update.mockResolvedValue({
        ...mockStudent,
        servicePlanId: "service-plan-id-2",
      });

      const result = await service.execute(
        "student-id",
        { servicePlanId: "service-plan-id-2" },
        mockCurrentUser,
      );

      expect(servicePlansRepository.findOwnedById).toHaveBeenCalledWith(
        "service-plan-id-2",
        "personal-id",
      );
      expect(studentsRepository.update).toHaveBeenCalledWith(
        "student-id",
        "personal-id",
        { servicePlanId: "service-plan-id-2" },
      );
      expect(usersRepository.update).not.toHaveBeenCalled();
      expect(result.servicePlanId).toBe("service-plan-id-2");
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
