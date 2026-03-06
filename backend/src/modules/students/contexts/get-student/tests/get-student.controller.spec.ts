import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { GetStudentController } from "../get-student.controller";
import { GetStudentService } from "../get-student.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockStudent = {
  id: "student-id",
  userId: "student-user-id",
  personalId: "personal-id",
  name: "Alice Silva",
  email: "alice@example.com",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("GetStudentController", () => {
  let controller: GetStudentController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new GetStudentController(
      service as unknown as GetStudentService,
    );
  });

  describe("handle", () => {
    it("should return the student data", async () => {
      service.execute.mockResolvedValue(mockStudent);

      const result = await controller.handle("student-id", mockCurrentUser);

      expect(result).toEqual(mockStudent);
      expect(service.execute).toHaveBeenCalledWith("student-id", mockCurrentUser);
    });

    it("should propagate NotFoundException", async () => {
      service.execute.mockRejectedValue(new NotFoundException());

      await expect(
        controller.handle("unknown-id", mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
