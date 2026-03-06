import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { RemoveExerciseController } from "../remove-exercise.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("RemoveExerciseController", () => {
  let controller: RemoveExerciseController;
  let removeExerciseService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    removeExerciseService = { execute: vi.fn() };
    controller = new RemoveExerciseController(removeExerciseService as any);
  });

  describe("handle", () => {
    it("should call service with planId, workoutExerciseId and currentUser", async () => {
      removeExerciseService.execute.mockResolvedValue(undefined);

      await controller.handle("plan-id", "we-id", mockCurrentUser);

      expect(removeExerciseService.execute).toHaveBeenCalledWith(
        "plan-id",
        "we-id",
        mockCurrentUser,
      );
    });
  });
});
