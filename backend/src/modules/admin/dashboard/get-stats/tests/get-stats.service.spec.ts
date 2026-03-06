import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetStatsService } from "../get-stats.service";

const mockRawStats = {
  mrr: 119.7,
  totalSubscribers: 4,
  newSubscribers: 2,
  churnCount: 1,
  totalStudents: 12,
};

const mockPreviousStats = {
  newSubscribers: 1,
};

describe("GetStatsService", () => {
  let service: GetStatsService;
  let dashboardRepository: {
    getStats: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    dashboardRepository = {
      getStats: vi.fn(),
    };
    service = new GetStatsService(dashboardRepository as any);
  });

  describe("execute", () => {
    it("should return stats with positive growth rate for 30d period", async () => {
      dashboardRepository.getStats
        .mockResolvedValueOnce(mockRawStats)
        .mockResolvedValueOnce(mockPreviousStats);

      const result = await service.execute("30d");

      expect(result.mrr).toBe(119.7);
      expect(result.totalSubscribers).toBe(4);
      expect(result.newSubscribers).toBe(2);
      expect(result.churnCount).toBe(1);
      expect(result.totalStudents).toBe(12);
      // growthRate: (2 - 1) / 1 * 100 = 100%
      expect(result.growthRate).toBe(100);
    });

    it("should return null growthRate when previous period had no subscribers", async () => {
      dashboardRepository.getStats
        .mockResolvedValueOnce(mockRawStats)
        .mockResolvedValueOnce({ newSubscribers: 0 });

      const result = await service.execute("30d");

      expect(result.growthRate).toBeNull();
    });

    it("should pass null since for 'all' period", async () => {
      dashboardRepository.getStats
        .mockResolvedValueOnce(mockRawStats)
        .mockResolvedValueOnce(mockPreviousStats);

      await service.execute("all");

      // First call: current period (since = null for 'all')
      expect(dashboardRepository.getStats).toHaveBeenNthCalledWith(1, null, null);
    });

    it("should pass a date for 7d period", async () => {
      dashboardRepository.getStats
        .mockResolvedValueOnce(mockRawStats)
        .mockResolvedValueOnce(mockPreviousStats);

      await service.execute("7d");

      const [since] = dashboardRepository.getStats.mock.calls[0];
      expect(since).toBeInstanceOf(Date);
    });

    it("should return zero growthRate when current and previous are equal", async () => {
      dashboardRepository.getStats
        .mockResolvedValueOnce({ ...mockRawStats, newSubscribers: 2 })
        .mockResolvedValueOnce({ newSubscribers: 2 });

      const result = await service.execute("30d");

      expect(result.growthRate).toBe(0);
    });
  });
});
