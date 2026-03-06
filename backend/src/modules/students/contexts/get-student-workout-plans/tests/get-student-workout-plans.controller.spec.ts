import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { GetStudentWorkoutPlansController } from "../get-student-workout-plans.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("GetStudentWorkoutPlansController", () => {
  let controller: GetStudentWorkoutPlansController;
  let getStudentWorkoutPlansService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    getStudentWorkoutPlansService = { execute: vi.fn() };
    controller = new GetStudentWorkoutPlansController(getStudentWorkoutPlansService as any);
  });

  describe("handle", () => {
    it("should call service with studentId and currentUser", async () => {
      const mockPlans = [{ id: "plan-id", name: "Treino A" }];
      getStudentWorkoutPlansService.execute.mockResolvedValue(mockPlans);

      const result = await controller.handle("student-id", mockCurrentUser);

      expect(getStudentWorkoutPlansService.execute).toHaveBeenCalledWith(
        "student-id",
        mockCurrentUser,
      );
      expect(result).toEqual(mockPlans);
    });
  });
});
