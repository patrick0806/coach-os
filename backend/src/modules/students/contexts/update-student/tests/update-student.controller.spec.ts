import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateStudentController } from "../update-student.controller";
import { UpdateStudentService } from "../update-student.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockUpdated = {
  id: "student-id",
  userId: "student-user-id",
  personalId: "personal-id",
  name: "Alice Santos",
  email: "alice@example.com",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
};

describe("UpdateStudentController", () => {
  let controller: UpdateStudentController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new UpdateStudentController(
      service as unknown as UpdateStudentService,
    );
  });

  describe("handle", () => {
    it("should return updated student data", async () => {
      service.execute.mockResolvedValue(mockUpdated);

      const result = await controller.handle(
        "student-id",
        { name: "Alice Santos" },
        mockCurrentUser,
      );

      expect(result).toEqual(mockUpdated);
      expect(service.execute).toHaveBeenCalledWith(
        "student-id",
        { name: "Alice Santos" },
        mockCurrentUser,
      );
    });

    it("should propagate NotFoundException", async () => {
      service.execute.mockRejectedValue(new NotFoundException());

      await expect(
        controller.handle("unknown-id", { name: "X" }, mockCurrentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
