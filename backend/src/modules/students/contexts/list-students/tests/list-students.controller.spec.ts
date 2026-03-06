import { describe, it, expect, beforeEach, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { ListStudentsController } from "../list-students.controller";
import { ListStudentsService } from "../list-students.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

const mockPaginatedResult = {
  content: [],
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 0,
};

describe("ListStudentsController", () => {
  let controller: ListStudentsController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new ListStudentsController(
      service as unknown as ListStudentsService,
    );
  });

  describe("handle", () => {
    it("should return paginated students", async () => {
      service.execute.mockResolvedValue(mockPaginatedResult);

      const result = await controller.handle(mockCurrentUser, 1, 10, undefined);

      expect(result).toEqual(mockPaginatedResult);
      expect(service.execute).toHaveBeenCalledWith(mockCurrentUser, {
        page: 1,
        size: 10,
        search: undefined,
      });
    });
  });
});
