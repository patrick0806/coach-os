import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateWorkoutPlanService } from "../create-workout-plan.service";

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
  description: "Foco em membros superiores",
  planKind: "template",
  sourceTemplateId: null,
  studentNames: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("CreateWorkoutPlanService", () => {
  let service: CreateWorkoutPlanService;
  let workoutPlansRepository: { create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlansRepository = { create: vi.fn() };
    service = new CreateWorkoutPlanService(workoutPlansRepository as any);
  });

  describe("execute", () => {
    it("should create a workout plan and return it", async () => {
      workoutPlansRepository.create.mockResolvedValue(mockPlan);

      const result = await service.execute(
        { name: "Treino A", description: "Foco em membros superiores" },
        mockCurrentUser,
      );

      expect(workoutPlansRepository.create).toHaveBeenCalledWith({
        personalId: "personal-id",
        name: "Treino A",
        description: "Foco em membros superiores",
        planKind: "template",
        sourceTemplateId: null,
      });
      expect(result).toEqual(mockPlan);
    });

    it("should create a workout plan without description", async () => {
      workoutPlansRepository.create.mockResolvedValue({ ...mockPlan, description: null });

      await service.execute({ name: "Treino A" }, mockCurrentUser);

      expect(workoutPlansRepository.create).toHaveBeenCalledWith({
        personalId: "personal-id",
        name: "Treino A",
        description: undefined,
        planKind: "template",
        sourceTemplateId: null,
      });
    });

    it("should create a workout plan with student kind when provided", async () => {
      workoutPlansRepository.create.mockResolvedValue({
        ...mockPlan,
        planKind: "student",
      });

      await service.execute({ name: "Treino A", planKind: "student" }, mockCurrentUser);

      expect(workoutPlansRepository.create).toHaveBeenCalledWith({
        personalId: "personal-id",
        name: "Treino A",
        description: undefined,
        planKind: "student",
        sourceTemplateId: null,
      });
    });

    it("should throw BadRequestException when name is empty", async () => {
      await expect(
        service.execute({ name: "" }, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
