import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { UpdateWorkoutPlanController } from "../update-workout-plan.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("UpdateWorkoutPlanController", () => {
  let controller: UpdateWorkoutPlanController;
  let updateWorkoutPlanService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    updateWorkoutPlanService = { execute: vi.fn() };
    controller = new UpdateWorkoutPlanController(updateWorkoutPlanService as any);
  });

  describe("handle", () => {
    it("should call service with id, dto and currentUser", async () => {
      const mockResult = { id: "plan-id", name: "Treino Atualizado" };
      updateWorkoutPlanService.execute.mockResolvedValue(mockResult);

      const dto = { name: "Treino Atualizado" };
      const result = await controller.handle("plan-id", dto, mockCurrentUser);

      expect(updateWorkoutPlanService.execute).toHaveBeenCalledWith(
        "plan-id",
        dto,
        mockCurrentUser,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
