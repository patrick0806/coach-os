import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListPersonalsService } from "../list-personals.service";

const mockPage = {
  content: [
    {
      id: "personal-1",
      userId: "user-1",
      slug: "john-doe",
      name: "John Doe",
      email: "john@example.com",
      isActive: true,
      subscriptionStatus: "active",
      subscriptionPlanName: "Pro",
      createdAt: new Date("2026-01-01"),
    },
  ],
  page: 1,
  size: 10,
  totalElements: 1,
  totalPages: 1,
};

describe("ListPersonalsService", () => {
  let service: ListPersonalsService;
  let adminPersonalsRepository: { findAllWithUser: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    adminPersonalsRepository = { findAllWithUser: vi.fn() };
    service = new ListPersonalsService(adminPersonalsRepository as any);
  });

  describe("execute", () => {
    it("should return paginated list of personals", async () => {
      adminPersonalsRepository.findAllWithUser.mockResolvedValue(mockPage);

      const result = await service.execute({ page: 1, size: 10 });

      expect(result).toEqual(mockPage);
      expect(adminPersonalsRepository.findAllWithUser).toHaveBeenCalledWith({ page: 1, size: 10, search: undefined });
    });

    it("should pass search filter to repository", async () => {
      adminPersonalsRepository.findAllWithUser.mockResolvedValue({ ...mockPage, content: [] });

      await service.execute({ page: 1, size: 10, search: "john" });

      expect(adminPersonalsRepository.findAllWithUser).toHaveBeenCalledWith({ page: 1, size: 10, search: "john" });
    });
  });
});
