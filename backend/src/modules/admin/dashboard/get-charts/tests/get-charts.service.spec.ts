import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetChartsService } from "../get-charts.service";

const mockDistribution = [
  { planName: "Basico", count: 1, percentage: 25 },
  { planName: "Pro", count: 3, percentage: 75 },
];

const mockTimeline = [
  { month: "2026-01", amount: 89.7 },
  { month: "2026-02", amount: 119.6 },
];

describe("GetChartsService", () => {
  let service: GetChartsService;
  let dashboardRepository: {
    getPlanDistribution: ReturnType<typeof vi.fn>;
    getRevenueTimeline: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    dashboardRepository = {
      getPlanDistribution: vi.fn().mockResolvedValue(mockDistribution),
      getRevenueTimeline: vi.fn().mockResolvedValue(mockTimeline),
    };
    service = new GetChartsService(dashboardRepository as any);
  });

  describe("execute", () => {
    it("should return plan distribution and revenue timeline", async () => {
      const result = await service.execute("30d");

      expect(result.planDistribution).toEqual(mockDistribution);
      expect(result.revenue).toEqual(mockTimeline);
    });

    it("should call getRevenueTimeline with 3 months for 90d period", async () => {
      await service.execute("90d");

      expect(dashboardRepository.getRevenueTimeline).toHaveBeenCalledWith(3);
    });

    it("should call getRevenueTimeline with 12 months for 'all' period", async () => {
      await service.execute("all");

      expect(dashboardRepository.getRevenueTimeline).toHaveBeenCalledWith(12);
    });

    it("should call getRevenueTimeline with 1 month for 7d period", async () => {
      await service.execute("7d");

      expect(dashboardRepository.getRevenueTimeline).toHaveBeenCalledWith(1);
    });
  });
});
