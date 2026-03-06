import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { DeleteExerciseController } from "../delete-exercise.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("DeleteExerciseController", () => {
  let controller: DeleteExerciseController;
  let deleteExerciseService: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    deleteExerciseService = { execute: vi.fn() };
    controller = new DeleteExerciseController(deleteExerciseService as any);
  });

  describe("handle", () => {
    it("should call service with exercise id and currentUser", async () => {
      deleteExerciseService.execute.mockResolvedValue(undefined);

      await controller.handle("exercise-own-1", mockCurrentUser);

      expect(deleteExerciseService.execute).toHaveBeenCalledWith(
        "exercise-own-1",
        mockCurrentUser,
      );
    });
  });
});
