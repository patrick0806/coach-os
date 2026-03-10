import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { ApplyTemplateService } from "../apply-template.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("ApplyTemplateService", () => {
  let service: ApplyTemplateService;
  let workoutPlansRepository: {
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let studentsRepository: {
    findById: ReturnType<typeof vi.fn>;
  };
  let workoutExercisesRepository: {
    findByWorkoutPlanId: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let workoutPlanStudentsRepository: {
    assign: ReturnType<typeof vi.fn>;
  };
  let drizzle: {
    db: {
      transaction: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    workoutPlansRepository = {
      findById: vi.fn(),
      create: vi.fn(),
    };
    studentsRepository = {
      findById: vi.fn(),
    };
    workoutExercisesRepository = {
      findByWorkoutPlanId: vi.fn(),
      create: vi.fn(),
    };
    workoutPlanStudentsRepository = {
      assign: vi.fn(),
    };
    drizzle = {
      db: {
        transaction: vi.fn(async (callback) => callback({})),
      },
    };

    service = new ApplyTemplateService(
      workoutPlansRepository as any,
      studentsRepository as any,
      workoutExercisesRepository as any,
      workoutPlanStudentsRepository as any,
      drizzle as any,
    );
  });

  it("cria copia de template e atribui ao aluno quando informado", async () => {
    workoutPlansRepository.findById.mockResolvedValue({
      id: "template-id",
      personalId: "personal-id",
      name: "Treino Base",
      description: "Base",
      planKind: "template",
    });
    studentsRepository.findById.mockResolvedValue({ id: "student-id" });
    workoutPlansRepository.create.mockResolvedValue({
      id: "new-plan-id",
      personalId: "personal-id",
      name: "Copia de Treino Base",
      description: "Base",
      planKind: "student",
      sourceTemplateId: "template-id",
      studentNames: [],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });
    workoutExercisesRepository.findByWorkoutPlanId.mockResolvedValue([
      {
        id: "we-1",
        exerciseId: "exercise-id",
        sets: 3,
        repetitions: 12,
        load: "20kg",
        order: 0,
        notes: "Controlado",
      },
    ]);
    workoutExercisesRepository.create.mockResolvedValue(undefined);
    workoutPlanStudentsRepository.assign.mockResolvedValue(undefined);

    const result = await service.execute(
      "template-id",
      { studentId: "7c14f8c8-8d08-4f40-9a0f-f5bd3474c8b9" },
      mockCurrentUser,
    );

    expect(workoutPlansRepository.create).toHaveBeenCalledWith(
      {
        personalId: "personal-id",
        name: "Copia de Treino Base",
        description: "Base",
        planKind: "student",
        sourceTemplateId: "template-id",
      },
      {},
    );
    expect(workoutExercisesRepository.create).toHaveBeenCalledWith(
      {
        workoutPlanId: "new-plan-id",
        exerciseId: "exercise-id",
        sets: 3,
        repetitions: 12,
        load: "20kg",
        order: 0,
        notes: "Controlado",
      },
      {},
    );
    expect(workoutPlanStudentsRepository.assign).toHaveBeenCalledWith(
      "new-plan-id",
      "7c14f8c8-8d08-4f40-9a0f-f5bd3474c8b9",
      {},
    );
    expect(result.id).toBe("new-plan-id");
  });

  it("retorna 404 para template inexistente", async () => {
    workoutPlansRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute("missing-id", {}, mockCurrentUser),
    ).rejects.toThrow(NotFoundException);
  });

  it("retorna 400 ao tentar aplicar plano do tipo student", async () => {
    workoutPlansRepository.findById.mockResolvedValue({
      id: "student-plan-id",
      planKind: "student",
    });

    await expect(
      service.execute("student-plan-id", {}, mockCurrentUser),
    ).rejects.toThrow(BadRequestException);
  });

  it("retorna 400 para aluno de outro tenant", async () => {
    workoutPlansRepository.findById.mockResolvedValue({
      id: "template-id",
      planKind: "template",
      name: "Treino Base",
      description: null,
    });
    studentsRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute("template-id", { studentId: "other-student-id" }, mockCurrentUser),
    ).rejects.toThrow(BadRequestException);
  });

  it("rollback completo se insercao de exercicios falhar", async () => {
    workoutPlansRepository.findById.mockResolvedValue({
      id: "template-id",
      personalId: "personal-id",
      name: "Treino Base",
      description: "Base",
      planKind: "template",
    });
    workoutPlansRepository.create.mockResolvedValue({
      id: "new-plan-id",
      personalId: "personal-id",
      name: "Copia de Treino Base",
      description: "Base",
      planKind: "student",
      sourceTemplateId: "template-id",
      studentNames: [],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });
    workoutExercisesRepository.findByWorkoutPlanId.mockResolvedValue([
      {
        id: "we-1",
        exerciseId: "exercise-id",
        sets: 3,
        repetitions: 12,
        load: null,
        order: 0,
        notes: null,
      },
    ]);
    workoutExercisesRepository.create.mockRejectedValue(new Error("insert failed"));

    await expect(service.execute("template-id", {}, mockCurrentUser)).rejects.toThrow(
      "insert failed",
    );
  });
});
