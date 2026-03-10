import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListBookingSeriesController } from "../list-booking-series.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("ListBookingSeriesController", () => {
  let controller: ListBookingSeriesController;
  let listBookingSeriesService: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    listBookingSeriesService = { execute: vi.fn() };
    controller = new ListBookingSeriesController(listBookingSeriesService as any);
  });

  it("should call service and return active series list", async () => {
    const mockResponse = [{ id: "series-id" }];
    listBookingSeriesService.execute.mockResolvedValue(mockResponse);

    const result = await controller.handle(mockCurrentUser);

    expect(listBookingSeriesService.execute).toHaveBeenCalledWith(mockCurrentUser);
    expect(result).toEqual(mockResponse);
  });
});
