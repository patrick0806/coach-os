import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { DeleteBookingScopeController } from "../delete-booking-scope.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("DeleteBookingScopeController", () => {
  let controller: DeleteBookingScopeController;
  let deleteBookingScopeService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    deleteBookingScopeService = { execute: vi.fn() };
    controller = new DeleteBookingScopeController(deleteBookingScopeService as any);
  });

  it("should call service and return scoped cancellation result", async () => {
    const response = {
      scope: "future" as const,
      cancelledBookings: 3,
      seriesCancelled: true,
    };
    deleteBookingScopeService.execute.mockResolvedValue(response);

    const result = await controller.handle("booking-id", { scope: "future" }, mockCurrentUser);

    expect(deleteBookingScopeService.execute).toHaveBeenCalledWith(
      "booking-id",
      { scope: "future" },
      mockCurrentUser,
    );
    expect(result).toEqual(response);
  });
});
