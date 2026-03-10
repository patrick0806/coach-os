import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { CreateStudentController } from "../create-student.controller";
import { CreateStudentService } from "../create-student.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockResponse = {
  studentId: "student-id",
  userId: "student-user-id",
  name: "Alice Silva",
  email: "alice@example.com",
  personalId: "personal-id",
  servicePlanId: "service-plan-id",
  servicePlanName: "Plano 3x por semana",
  createdAt: new Date("2024-01-01"),
};

describe("CreateStudentController", () => {
  let controller: CreateStudentController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new CreateStudentController(
      service as unknown as CreateStudentService,
    );
  });

  describe("handle", () => {
    it("should create student and return data", async () => {
      service.execute.mockResolvedValue(mockResponse);

      const result = await controller.handle(
        {
          name: "Alice Silva",
          email: "alice@example.com",
          servicePlanId: "service-plan-id",
        },
        mockCurrentUser,
      );

      expect(result).toEqual(mockResponse);
      expect(service.execute).toHaveBeenCalledWith(
        {
          name: "Alice Silva",
          email: "alice@example.com",
          servicePlanId: "service-plan-id",
        },
        mockCurrentUser,
      );
    });

    it("should propagate ConflictException when email already exists", async () => {
      service.execute.mockRejectedValue(new ConflictException());

      await expect(
        controller.handle(
          {
            name: "Alice",
            email: "existing@example.com",
            servicePlanId: "service-plan-id",
          },
          mockCurrentUser,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });
});
