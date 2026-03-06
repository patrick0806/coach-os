import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { DeleteWorkoutPlanController } from "../delete-workout-plan.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("DeleteWorkoutPlanController", () => {
  let controller: DeleteWorkoutPlanController;
  let deleteWorkoutPlanService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    deleteWorkoutPlanService = { execute: vi.fn() };
    controller = new DeleteWorkoutPlanController(deleteWorkoutPlanService as any);
  });

  describe("handle", () => {
    it("should call service with id and currentUser", async () => {
      deleteWorkoutPlanService.execute.mockResolvedValue(undefined);

      await controller.handle("plan-id", mockCurrentUser);

      expect(deleteWorkoutPlanService.execute).toHaveBeenCalledWith("plan-id", mockCurrentUser);
    });
  });
});
