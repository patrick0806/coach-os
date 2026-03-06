import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListStudentsService } from "../list-students.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPaginatedResult = {
  content: [
    {
      id: "student-id",
      userId: "student-user-id",
      personalId: "personal-id",
      name: "Alice Silva",
      email: "alice@example.com",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  page: 1,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

describe("ListStudentsService", () => {
  let service: ListStudentsService;
  let studentsRepository: {
    findAll: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    studentsRepository = { findAll: vi.fn() };
    service = new ListStudentsService(studentsRepository as any);
  });

  describe("execute", () => {
    it("should return paginated students for the authenticated personal", async () => {
      studentsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await service.execute(mockCurrentUser, {
        page: 1,
        size: 10,
      });

      expect(result).toEqual(mockPaginatedResult);
      expect(studentsRepository.findAll).toHaveBeenCalledWith(
        "personal-id",
        { page: 1, size: 10, search: undefined },
      );
    });

    it("should pass search param when provided", async () => {
      studentsRepository.findAll.mockResolvedValue({
        ...mockPaginatedResult,
        content: [],
        totalElements: 0,
        totalPages: 0,
      });

      await service.execute(mockCurrentUser, { page: 1, size: 10, search: "alice" });

      expect(studentsRepository.findAll).toHaveBeenCalledWith(
        "personal-id",
        { page: 1, size: 10, search: "alice" },
      );
    });
  });
});
