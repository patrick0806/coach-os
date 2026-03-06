import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { CreateWorkoutPlanController } from "../create-workout-plan.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPlan = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Treino A",
  description: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("CreateWorkoutPlanController", () => {
  let controller: CreateWorkoutPlanController;
  let createWorkoutPlanService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    createWorkoutPlanService = { execute: vi.fn() };
    controller = new CreateWorkoutPlanController(createWorkoutPlanService as any);
  });

  describe("handle", () => {
    it("should call service and return created plan", async () => {
      createWorkoutPlanService.execute.mockResolvedValue(mockPlan);

      const dto = { name: "Treino A" };
      const result = await controller.handle(dto, mockCurrentUser);

      expect(createWorkoutPlanService.execute).toHaveBeenCalledWith(dto, mockCurrentUser);
      expect(result).toEqual(mockPlan);
    });
  });
});
