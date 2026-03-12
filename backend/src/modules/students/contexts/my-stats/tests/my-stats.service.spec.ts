import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { MyStatsService } from "../my-stats.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.STUDENT,
  profileId: "student-id",
  personalId: "personal-id",
  personalSlug: "john-doe",
};

describe("MyStatsService", () => {
  let service: MyStatsService;
  let studentStatsRepository: {
    findById: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    studentStatsRepository = { findById: vi.fn() };
    service = new MyStatsService(studentStatsRepository as any);
  });

  describe("execute", () => {
    it("should return student stats", async () => {
      studentStatsRepository.findById.mockResolvedValue({
        currentStreak: 5,
        lastWorkoutDate: "2026-03-11",
        totalWorkouts: 42,
      });

      const result = await service.execute(mockCurrentUser);

      expect(studentStatsRepository.findById).toHaveBeenCalledWith("student-id");
      expect(result).toEqual({
        currentStreak: 5,
        lastWorkoutDate: "2026-03-11",
        totalWorkouts: 42,
      });
    });

    it("should throw NotFoundException when student not found", async () => {
      studentStatsRepository.findById.mockResolvedValue(null);

      await expect(service.execute(mockCurrentUser)).rejects.toThrow(NotFoundException);
    });
  });
});
