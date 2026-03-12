import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateStudentPlanService } from "../create-student-plan.service";

const STUDENT_ID = "7c14f8c8-8d08-4f40-9a0f-f5bd3474c8b9";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("CreateStudentPlanService", () => {
  let service: CreateStudentPlanService;
  let workoutPlansRepository: {
    create: ReturnType<typeof vi.fn>;
  };
  let studentsRepository: {
    findById: ReturnType<typeof vi.fn>;
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
    workoutPlansRepository = { create: vi.fn() };
    studentsRepository = { findById: vi.fn() };
    workoutPlanStudentsRepository = { assign: vi.fn() };
    drizzle = {
      db: {
        transaction: vi.fn(async (callback) => callback({})),
      },
    };

    service = new CreateStudentPlanService(
      workoutPlansRepository as any,
      studentsRepository as any,
      workoutPlanStudentsRepository as any,
      drizzle as any,
    );
  });

  it("cria treino manual do tipo student e vincula ao aluno", async () => {
    studentsRepository.findById.mockResolvedValue({ id: STUDENT_ID });
    workoutPlansRepository.create.mockResolvedValue({
      id: "new-plan-id",
      personalId: "personal-id",
      name: "Treino Manual",
      description: null,
      planKind: "student",
      sourceTemplateId: null,
      studentNames: [],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });
    workoutPlanStudentsRepository.assign.mockResolvedValue(undefined);

    const result = await service.execute(
      { name: "Treino Manual", studentId: STUDENT_ID },
      mockCurrentUser,
    );

    expect(studentsRepository.findById).toHaveBeenCalledWith(STUDENT_ID, "personal-id");
    expect(workoutPlansRepository.create).toHaveBeenCalledWith(
      {
        personalId: "personal-id",
        name: "Treino Manual",
        description: undefined,
        planKind: "student",
        sourceTemplateId: null,
      },
      {},
    );
    expect(workoutPlanStudentsRepository.assign).toHaveBeenCalledWith(
      "new-plan-id",
      STUDENT_ID,
      {},
    );
    expect(result.id).toBe("new-plan-id");
    expect(result.planKind).toBe("student");
  });

  it("cria treino manual com descricao quando fornecida", async () => {
    studentsRepository.findById.mockResolvedValue({ id: STUDENT_ID });
    workoutPlansRepository.create.mockResolvedValue({
      id: "new-plan-id",
      personalId: "personal-id",
      name: "Treino Costas",
      description: "Foco em dorsais",
      planKind: "student",
      sourceTemplateId: null,
      studentNames: [],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });
    workoutPlanStudentsRepository.assign.mockResolvedValue(undefined);

    await service.execute(
      { name: "Treino Costas", description: "Foco em dorsais", studentId: STUDENT_ID },
      mockCurrentUser,
    );

    expect(workoutPlansRepository.create).toHaveBeenCalledWith(
      {
        personalId: "personal-id",
        name: "Treino Costas",
        description: "Foco em dorsais",
        planKind: "student",
        sourceTemplateId: null,
      },
      {},
    );
  });

  it("retorna 404 quando aluno nao pertence ao tenant", async () => {
    studentsRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute(
        { name: "Treino X", studentId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
        mockCurrentUser,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("retorna 400 quando nome esta vazio", async () => {
    await expect(
      service.execute({ name: "", studentId: STUDENT_ID }, mockCurrentUser),
    ).rejects.toThrow(BadRequestException);
  });

  it("retorna 400 quando studentId nao e um UUID valido", async () => {
    await expect(
      service.execute({ name: "Treino X", studentId: "invalid-uuid" }, mockCurrentUser),
    ).rejects.toThrow(BadRequestException);
  });

  it("rollback completo se vinculacao ao aluno falhar", async () => {
    studentsRepository.findById.mockResolvedValue({ id: STUDENT_ID });
    workoutPlansRepository.create.mockResolvedValue({
      id: "new-plan-id",
      personalId: "personal-id",
      name: "Treino Manual",
      description: null,
      planKind: "student",
      sourceTemplateId: null,
      studentNames: [],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });
    workoutPlanStudentsRepository.assign.mockRejectedValue(new Error("assign failed"));

    await expect(
      service.execute({ name: "Treino Manual", studentId: STUDENT_ID }, mockCurrentUser),
    ).rejects.toThrow("assign failed");
  });
});
