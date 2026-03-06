import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { MyWorkoutPlansController } from "../my-workout-plans.controller";

const mockStudentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "student-id",
};

describe("MyWorkoutPlansController", () => {
  let controller: MyWorkoutPlansController;
  let myWorkoutPlansService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    myWorkoutPlansService = { execute: vi.fn() };
    controller = new MyWorkoutPlansController(myWorkoutPlansService as any);
  });

  describe("handle", () => {
    it("should call service with currentUser and return plans", async () => {
      const mockPlans = [{ id: "plan-id", name: "Treino A" }];
      myWorkoutPlansService.execute.mockResolvedValue(mockPlans);

      const result = await controller.handle(mockStudentUser);

      expect(myWorkoutPlansService.execute).toHaveBeenCalledWith(mockStudentUser);
      expect(result).toEqual(mockPlans);
    });
  });
});
