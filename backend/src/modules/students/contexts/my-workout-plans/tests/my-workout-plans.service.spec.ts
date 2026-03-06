import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { MyWorkoutPlansService } from "../my-workout-plans.service";

const mockStudentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "student-id",
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

describe("MyWorkoutPlansService", () => {
  let service: MyWorkoutPlansService;
  let workoutPlanStudentsRepository: { findByStudentId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlanStudentsRepository = { findByStudentId: vi.fn() };
    service = new MyWorkoutPlansService(workoutPlanStudentsRepository as any);
  });

  describe("execute", () => {
    it("should return plans assigned to the authenticated student", async () => {
      workoutPlanStudentsRepository.findByStudentId.mockResolvedValue(mockPlans);

      const result = await service.execute(mockStudentUser);

      expect(workoutPlanStudentsRepository.findByStudentId).toHaveBeenCalledWith(
        "student-id",
        "personal-id",
      );
      expect(result).toEqual(mockPlans);
    });

    it("should return empty array when no plans are assigned", async () => {
      workoutPlanStudentsRepository.findByStudentId.mockResolvedValue([]);

      const result = await service.execute(mockStudentUser);

      expect(result).toEqual([]);
    });
  });
});
