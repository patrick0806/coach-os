import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetStatsService } from "../get-stats.service";

const mockRawStats = {
  mrr: 119.7,
  totalSubscribers: 4,
  newSubscribers: 2,
  churnCount: 1,
  totalStudents: 12,
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
    it("should return stats with churnRate calculated from churnCount", async () => {
      dashboardRepository.getStats.mockResolvedValueOnce(mockRawStats);

      const result = await service.execute("30d");

      expect(result.mrr).toBe(119.7);
      expect(result.totalSubscribers).toBe(4);
      expect(result.newSubscribers).toBe(2);
      expect(result.totalStudents).toBe(12);
      // churnRate: (1 / 4) * 100 = 25.0
      expect(result.churnRate).toBe(25.0);
    });

    it("should return churnRate of 0 when there are no active subscribers", async () => {
      dashboardRepository.getStats.mockResolvedValueOnce({
        ...mockRawStats,
        totalSubscribers: 0,
        churnCount: 0,
      });

      const result = await service.execute("30d");

      expect(result.churnRate).toBe(0);
    });

    it("should pass null since for 'all' period", async () => {
      dashboardRepository.getStats.mockResolvedValueOnce(mockRawStats);

      await service.execute("all");

      expect(dashboardRepository.getStats).toHaveBeenCalledWith(null, null);
    });

    it("should pass a date for 7d period", async () => {
      dashboardRepository.getStats.mockResolvedValueOnce(mockRawStats);

      await service.execute("7d");

      const [since] = dashboardRepository.getStats.mock.calls[0];
      expect(since).toBeInstanceOf(Date);
    });

    it("should call getStats only once per execute", async () => {
      dashboardRepository.getStats.mockResolvedValueOnce(mockRawStats);

      await service.execute("30d");

      expect(dashboardRepository.getStats).toHaveBeenCalledTimes(1);
    });
  });
});
