import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { AssignStudentsService } from "../assign-students.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPlan = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Treino A",
  description: null,
  exercises: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
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

describe("AssignStudentsService", () => {
  let service: AssignStudentsService;
  let workoutPlansRepository: { findById: ReturnType<typeof vi.fn> };
  let studentsRepository: { findById: ReturnType<typeof vi.fn> };
  let workoutPlanStudentsRepository: {
    findAssignment: ReturnType<typeof vi.fn>;
    assign: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    workoutPlansRepository = { findById: vi.fn() };
    studentsRepository = { findById: vi.fn() };
    workoutPlanStudentsRepository = {
      findAssignment: vi.fn(),
      assign: vi.fn(),
    };
    service = new AssignStudentsService(
      workoutPlansRepository as any,
      studentsRepository as any,
      workoutPlanStudentsRepository as any,
    );
  });

  describe("execute", () => {
    it("should assign multiple students to a workout plan", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      studentsRepository.findById.mockResolvedValue(mockStudent);
      workoutPlanStudentsRepository.findAssignment.mockResolvedValue(null);
      workoutPlanStudentsRepository.assign.mockResolvedValue({
        id: "assignment-id",
        workoutPlanId: "plan-id",
        studentId: "student-id",
      });

      await service.execute("plan-id", ["student-id"], mockCurrentUser);

      expect(workoutPlansRepository.findById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(studentsRepository.findById).toHaveBeenCalledWith("student-id", "personal-id");
      expect(workoutPlanStudentsRepository.assign).toHaveBeenCalledWith("plan-id", "student-id");
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("other-plan", ["student-id"], mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException when student does not belong to personal", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      studentsRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute("plan-id", ["other-student"], mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException when assignment already exists", async () => {
      workoutPlansRepository.findById.mockResolvedValue(mockPlan);
      studentsRepository.findById.mockResolvedValue(mockStudent);
      workoutPlanStudentsRepository.findAssignment.mockResolvedValue({
        id: "existing-assignment",
        workoutPlanId: "plan-id",
        studentId: "student-id",
      });

      await expect(
        service.execute("plan-id", ["student-id"], mockCurrentUser),
      ).rejects.toThrow(ConflictException);
    });
  });
});
