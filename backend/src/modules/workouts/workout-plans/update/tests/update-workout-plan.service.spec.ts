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
    create: ReturnType<typeof vi.fn>;
  };
  let workoutExercisesRepository: {
    findByWorkoutPlanId: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let workoutPlanStudentsRepository: {
    assign: ReturnType<typeof vi.fn>;
    revoke: ReturnType<typeof vi.fn>;
  };
  let studentsRepository: {
    findById: ReturnType<typeof vi.fn>;
  };
  let drizzle: {
    db: {
      transaction: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    workoutPlansRepository = {
      findById: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    };
    workoutExercisesRepository = {
      findByWorkoutPlanId: vi.fn(),
      create: vi.fn(),
    };
    workoutPlanStudentsRepository = {
      assign: vi.fn(),
      revoke: vi.fn(),
    };
    studentsRepository = {
      findById: vi.fn(),
    };
    drizzle = {
      db: {
        transaction: vi.fn(async (callback) => callback({})),
      },
    };

    service = new UpdateWorkoutPlanService(
      workoutPlansRepository as never,
      workoutExercisesRepository as never,
      workoutPlanStudentsRepository as never,
      studentsRepository as never,
      drizzle as never,
    );
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

  it("should fork a template for a student and return the fork detail", async () => {
    const forkedPlan = {
      ...mockPlanDetail,
      id: "forked-plan-id",
      name: "Treino A do aluno",
      planKind: "student" as const,
      sourceTemplateId: "plan-id",
    };
    const templateExercises = [
      {
        id: "workout-exercise-id",
        exerciseId: "exercise-id",
        exerciseName: "Supino",
        muscleGroup: "peito",
        exercisedbGifUrl: null,
        youtubeUrl: null,
        sets: 4,
        repetitions: 10,
        load: "20kg",
        order: 0,
        notes: "controlado",
      },
    ];

    workoutPlansRepository.findById
      .mockResolvedValueOnce({
        ...mockPlanDetail,
        studentNames: ["Aluno"],
      })
      .mockResolvedValueOnce({
        ...forkedPlan,
        studentNames: ["Aluno"],
        exercises: templateExercises,
      });
    studentsRepository.findById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Aluno",
    });
    workoutPlansRepository.create.mockResolvedValue(forkedPlan);
    workoutExercisesRepository.findByWorkoutPlanId.mockResolvedValue(templateExercises);

    const result = await service.execute(
      "plan-id",
      {
        name: "Treino A do aluno",
        description: "Descricao",
        forkForStudentId: "11111111-1111-4111-8111-111111111111",
      },
      mockCurrentUser,
    );

    expect(workoutPlansRepository.create).toHaveBeenCalledWith(
      {
        personalId: "personal-id",
        name: "Treino A do aluno",
        description: "Descricao",
        planKind: "student",
        sourceTemplateId: "plan-id",
      },
      {},
    );
    expect(workoutExercisesRepository.create).toHaveBeenCalledWith(
      {
        workoutPlanId: "forked-plan-id",
        exerciseId: "exercise-id",
        sets: 4,
        repetitions: 10,
        load: "20kg",
        order: 0,
        notes: "controlado",
      },
      {},
    );
    expect(workoutPlanStudentsRepository.assign).toHaveBeenCalledWith(
      "forked-plan-id",
      "11111111-1111-4111-8111-111111111111",
      {},
    );
    expect(workoutPlanStudentsRepository.revoke).toHaveBeenCalledWith(
      "plan-id",
      "11111111-1111-4111-8111-111111111111",
      {},
    );
    expect(result).toEqual({
      ...forkedPlan,
      studentNames: ["Aluno"],
      exercises: templateExercises,
    });
  });
});
