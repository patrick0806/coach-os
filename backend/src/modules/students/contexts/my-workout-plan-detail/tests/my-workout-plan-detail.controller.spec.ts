import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { MyWorkoutPlanDetailController } from "../my-workout-plan-detail.controller";

const mockStudentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "student-id",
};

const mockPlanDetail = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Treino A",
  description: null,
  exercises: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("MyWorkoutPlanDetailController", () => {
  let controller: MyWorkoutPlanDetailController;
  let myWorkoutPlanDetailService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    myWorkoutPlanDetailService = { execute: vi.fn() };
    controller = new MyWorkoutPlanDetailController(myWorkoutPlanDetailService as any);
  });

  describe("handle", () => {
    it("should call service with planId and currentUser", async () => {
      myWorkoutPlanDetailService.execute.mockResolvedValue(mockPlanDetail);

      const result = await controller.handle("plan-id", mockStudentUser);

      expect(myWorkoutPlanDetailService.execute).toHaveBeenCalledWith("plan-id", mockStudentUser);
      expect(result).toEqual(mockPlanDetail);
    });
  });
});
