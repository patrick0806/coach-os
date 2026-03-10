import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateWorkoutPlanService } from "../update-workout-plan.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockUpdatedPlan = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Treino A Atualizado",
  description: "Nova descricao",
  planKind: "template",
  sourceTemplateId: null,
  studentNames: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
};

describe("UpdateWorkoutPlanService", () => {
  let service: UpdateWorkoutPlanService;
  let workoutPlansRepository: { update: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlansRepository = { update: vi.fn() };
    service = new UpdateWorkoutPlanService(workoutPlansRepository as any);
  });

  describe("execute", () => {
    it("should update and return the workout plan", async () => {
      workoutPlansRepository.update.mockResolvedValue(mockUpdatedPlan);

      const result = await service.execute(
        "plan-id",
        { name: "Treino A Atualizado", description: "Nova descricao" },
        mockCurrentUser,
      );

      expect(workoutPlansRepository.update).toHaveBeenCalledWith(
        "plan-id",
        "personal-id",
        { name: "Treino A Atualizado", description: "Nova descricao" },
      );
      expect(result).toEqual(mockUpdatedPlan);
    });

    it("should throw NotFoundException when plan does not belong to personal", async () => {
      workoutPlansRepository.update.mockResolvedValue(null);

      await expect(
        service.execute("other-plan", { name: "X" }, mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
