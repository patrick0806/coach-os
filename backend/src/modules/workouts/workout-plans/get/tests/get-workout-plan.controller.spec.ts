import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { GetWorkoutPlanController } from "../get-workout-plan.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
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

describe("GetWorkoutPlanController", () => {
  let controller: GetWorkoutPlanController;
  let getWorkoutPlanService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    getWorkoutPlanService = { execute: vi.fn() };
    controller = new GetWorkoutPlanController(getWorkoutPlanService as any);
  });

  describe("handle", () => {
    it("should call service and return plan with exercises", async () => {
      getWorkoutPlanService.execute.mockResolvedValue(mockPlanDetail);

      const result = await controller.handle("plan-id", mockCurrentUser);

      expect(getWorkoutPlanService.execute).toHaveBeenCalledWith("plan-id", mockCurrentUser);
      expect(result).toEqual(mockPlanDetail);
    });
  });
});
