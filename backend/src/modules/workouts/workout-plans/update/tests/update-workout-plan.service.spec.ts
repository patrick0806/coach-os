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

const mockPlanDetail = {
  id: "plan-id",
  personalId: "personal-id",
  name: "Treino A",
  description: "Descricao",
  planKind: "template" as const,
  sourceTemplateId: null,
  studentNames: [],
  exercises: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
};

describe("UpdateWorkoutPlanService", () => {
  let service: UpdateWorkoutPlanService;
  let workoutPlansRepository: {
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    workoutPlansRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    };

    service = new UpdateWorkoutPlanService(workoutPlansRepository as never);
  });

  it("should update and return the workout plan detail", async () => {
    workoutPlansRepository.findById
      .mockResolvedValueOnce(mockPlanDetail)
      .mockResolvedValueOnce({
        ...mockPlanDetail,
        name: "Treino A Atualizado",
        description: "Nova descricao",
      });
    workoutPlansRepository.update.mockResolvedValue({
      ...mockPlanDetail,
      name: "Treino A Atualizado",
      description: "Nova descricao",
    });

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
    expect(result).toEqual({
      ...mockPlanDetail,
      name: "Treino A Atualizado",
      description: "Nova descricao",
    });
  });

  it("should throw NotFoundException when plan does not exist", async () => {
    workoutPlansRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute("other-plan", { name: "X" }, mockCurrentUser),
    ).rejects.toThrow(NotFoundException);
  });
});
