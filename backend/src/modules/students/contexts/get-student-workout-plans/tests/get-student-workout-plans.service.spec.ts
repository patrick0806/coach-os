import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { GetStudentWorkoutPlansService } from "../get-student-workout-plans.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockStudent = {
  id: "student-id",
  userId: "user-id-2",
  personalId: "personal-id",
  name: "Alice",
  email: "alice@example.com",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockPlans = [
  {
    id: "plan-id",
    personalId: "personal-id",
    name: "Treino A",
    description: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("GetStudentWorkoutPlansService", () => {
  let service: GetStudentWorkoutPlansService;
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };
  let workoutPlanStudentsRepository: { findByStudentId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    studentsRepository = { findById: vi.fn() };
    workoutPlanStudentsRepository = { findByStudentId: vi.fn() };
    service = new GetStudentWorkoutPlansService(
      studentsRepository as any,
      workoutPlanStudentsRepository as any,
    );
  });

  describe("execute", () => {
    it("should return workout plans assigned to a student", async () => {
      studentsRepository.findById.mockResolvedValue(mockStudent);
      workoutPlanStudentsRepository.findByStudentId.mockResolvedValue(mockPlans);

      const result = await service.execute("student-id", mockCurrentUser);

      expect(studentsRepository.findById).toHaveBeenCalledWith("student-id", "personal-id");
      expect(workoutPlanStudentsRepository.findByStudentId).toHaveBeenCalledWith(
        "student-id",
        "personal-id",
      );
      expect(result).toEqual(mockPlans);
    });

    it("should throw NotFoundException when student does not belong to personal", async () => {
      studentsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("other-student", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should return empty array when student has no assigned plans", async () => {
      studentsRepository.findById.mockResolvedValue(mockStudent);
      workoutPlanStudentsRepository.findByStudentId.mockResolvedValue([]);

      const result = await service.execute("student-id", mockCurrentUser);

      expect(result).toEqual([]);
    });
  });
});
