import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { CreateStudentPlanController } from "../create-student-plan.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPlan = {
  id: "new-plan-id",
  personalId: "personal-id",
  name: "Treino Manual",
  description: null,
  planKind: "student" as const,
  sourceTemplateId: null,
  studentNames: [],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("CreateStudentPlanController", () => {
  let controller: CreateStudentPlanController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new CreateStudentPlanController(service as any);
  });

  it("deve chamar service com dto e currentUser e retornar o plano criado", async () => {
    service.execute.mockResolvedValue(mockPlan);

    const dto = { name: "Treino Manual", studentId: "student-id" };
    const result = await controller.handle(dto as any, mockCurrentUser);

    expect(service.execute).toHaveBeenCalledWith(dto, mockCurrentUser);
    expect(result).toEqual(mockPlan);
  });
});
