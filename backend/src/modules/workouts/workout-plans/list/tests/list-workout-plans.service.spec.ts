import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListWorkoutPlansService } from "../list-workout-plans.service";

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
      id: "plan-id",
      personalId: "personal-id",
      name: "Treino A",
      description: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  page: 1,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

describe("ListWorkoutPlansService", () => {
  let service: ListWorkoutPlansService;
  let workoutPlansRepository: { findAll: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    workoutPlansRepository = { findAll: vi.fn() };
    service = new ListWorkoutPlansService(workoutPlansRepository as any);
  });

  describe("execute", () => {
    it("should return paginated workout plans for the authenticated personal", async () => {
      workoutPlansRepository.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await service.execute(mockCurrentUser, { page: 1, size: 10 });

      expect(workoutPlansRepository.findAll).toHaveBeenCalledWith("personal-id", {
        page: 1,
        size: 10,
      });
      expect(result).toEqual(mockPaginatedResult);
    });

    it("should return empty page when no plans exist", async () => {
      workoutPlansRepository.findAll.mockResolvedValue({
        content: [],
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      });

      const result = await service.execute(mockCurrentUser, { page: 1, size: 10 });

      expect(result.content).toHaveLength(0);
    });
  });
});
