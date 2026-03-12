import { describe, it, expect, beforeEach, vi } from "vitest";

import { StreakService } from "../streak.service";

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateString(d);
}

describe("StreakService", () => {
  let service: StreakService;
  let studentStatsRepository: {
    findById: ReturnType<typeof vi.fn>;
    updateStats: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    studentStatsRepository = {
      findById: vi.fn(),
      updateStats: vi.fn(),
    };
    service = new StreakService(studentStatsRepository as any);
  });

  describe("calculateNewStreak (pure logic)", () => {
    it("should return 1 when there is no previous workout", () => {
      expect(service.calculateNewStreak(null, 0)).toBe(1);
    });

    it("should increment streak when last workout was yesterday", () => {
      expect(service.calculateNewStreak(daysAgo(1), 5)).toBe(6);
    });

    it("should maintain streak when last workout was today", () => {
      expect(service.calculateNewStreak(daysAgo(0), 5)).toBe(5);
    });

    it("should reset to 1 when last workout was 2 days ago", () => {
      expect(service.calculateNewStreak(daysAgo(2), 5)).toBe(1);
    });

    it("should reset to 1 when last workout was more than 2 days ago", () => {
      expect(service.calculateNewStreak(daysAgo(10), 8)).toBe(1);
    });
  });

  describe("updateStudentStats", () => {
    it("should update stats correctly after a workout", async () => {
      const today = toDateString(new Date());
      studentStatsRepository.findById.mockResolvedValue({
        currentStreak: 3,
        lastWorkoutDate: daysAgo(1),
        totalWorkouts: 15,
      });
      studentStatsRepository.updateStats.mockResolvedValue(undefined);

      await service.updateStudentStats("student-id");

      expect(studentStatsRepository.updateStats).toHaveBeenCalledWith("student-id", {
        currentStreak: 4,
        lastWorkoutDate: today,
        totalWorkouts: 16,
      });
    });

    it("should reset streak to 1 when more than 1 day has passed", async () => {
      const today = toDateString(new Date());
      studentStatsRepository.findById.mockResolvedValue({
        currentStreak: 10,
        lastWorkoutDate: daysAgo(3),
        totalWorkouts: 30,
      });
      studentStatsRepository.updateStats.mockResolvedValue(undefined);

      await service.updateStudentStats("student-id");

      expect(studentStatsRepository.updateStats).toHaveBeenCalledWith("student-id", {
        currentStreak: 1,
        lastWorkoutDate: today,
        totalWorkouts: 31,
      });
    });

    it("should not increment totalWorkouts when workout was already registered today", async () => {
      const today = toDateString(new Date());
      studentStatsRepository.findById.mockResolvedValue({
        currentStreak: 5,
        lastWorkoutDate: today,
        totalWorkouts: 20,
      });
      studentStatsRepository.updateStats.mockResolvedValue(undefined);

      await service.updateStudentStats("student-id");

      expect(studentStatsRepository.updateStats).toHaveBeenCalledWith("student-id", {
        currentStreak: 5,
        lastWorkoutDate: today,
        totalWorkouts: 20,
      });
    });
  });
});
