import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { MyWorkoutPlanDetailService } from "../my-workout-plan-detail.service";

const mockStudentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "student-id",
};

const mockAssignment = {
  id: "assignment-id",
  workoutPlanId: "plan-id",
  studentId: "student-id",
};

const mockPlanDetail = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Treino A",
  description: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  exercises: [
    {
      id: "we-id",
      exerciseId: "exercise-id",
      exerciseName: "Supino Reto",
      muscleGroup: "peito",
      exercisedbGifUrl: "https://cdn.example.com/supino.gif",
      youtubeUrl: null,
      sets: 3,
      repetitions: 12,
      load: "20kg",
      order: 0,
      notes: null,
    },
  ],
};

describe("MyWorkoutPlanDetailService", () => {
  let service: MyWorkoutPlanDetailService;
  let workoutPlanStudentsRepository: { findAssignment: ReturnType<typeof vi.fn> };
  let workoutPlansRepository: { findById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlanStudentsRepository = { findAssignment: vi.fn() };
    workoutPlansRepository = { findById: vi.fn() };
    service = new MyWorkoutPlanDetailService(
      workoutPlanStudentsRepository as any,
      workoutPlansRepository as any,
    );
  });

  describe("execute", () => {
    it("should return the workout plan detail for the authenticated student", async () => {
      workoutPlanStudentsRepository.findAssignment.mockResolvedValue(mockAssignment);
      workoutPlansRepository.findById.mockResolvedValue(mockPlanDetail);

      const result = await service.execute("plan-id", mockStudentUser);

      expect(workoutPlanStudentsRepository.findAssignment).toHaveBeenCalledWith(
        "plan-id",
        "student-id",
      );
      expect(workoutPlansRepository.findById).toHaveBeenCalledWith("plan-id", "personal-id");
      expect(result).toEqual(mockPlanDetail);
    });

    it("should throw NotFoundException when student is not assigned to the plan", async () => {
      workoutPlanStudentsRepository.findAssignment.mockResolvedValue(null);

      await expect(service.execute("other-plan", mockStudentUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(workoutPlansRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when plan detail is not found", async () => {
      workoutPlanStudentsRepository.findAssignment.mockResolvedValue(mockAssignment);
      workoutPlansRepository.findById.mockResolvedValue(null);

      await expect(service.execute("plan-id", mockStudentUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
