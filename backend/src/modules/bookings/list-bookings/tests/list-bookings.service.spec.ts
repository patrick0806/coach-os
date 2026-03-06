import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListBookingsService } from "../list-bookings.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPaginated = {
  content: [],
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 0,
};

describe("ListBookingsService", () => {
  let service: ListBookingsService;
  let bookingsRepository: { findByPersonal: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bookingsRepository = { findByPersonal: vi.fn() };
    service = new ListBookingsService(bookingsRepository as any);
  });

  describe("execute", () => {
    it("should return paginated bookings for the personal", async () => {
      bookingsRepository.findByPersonal.mockResolvedValue(mockPaginated);

      const result = await service.execute({}, mockCurrentUser);

      expect(bookingsRepository.findByPersonal).toHaveBeenCalledWith(
        "personal-id",
        expect.objectContaining({ page: 1, size: 10 }),
      );
      expect(result).toEqual(mockPaginated);
    });

    it("should pass status filter when provided", async () => {
      bookingsRepository.findByPersonal.mockResolvedValue(mockPaginated);

      await service.execute({ status: "scheduled", page: 2, size: 5 }, mockCurrentUser);

      expect(bookingsRepository.findByPersonal).toHaveBeenCalledWith(
        "personal-id",
        expect.objectContaining({ status: "scheduled", page: 2, size: 5 }),
      );
    });
  });
});
