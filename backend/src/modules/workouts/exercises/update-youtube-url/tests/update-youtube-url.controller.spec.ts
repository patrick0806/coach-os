import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationRoles } from "@shared/enums";
import { UpdateYoutubeUrlController } from "../update-youtube-url.controller";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("UpdateYoutubeUrlController", () => {
  let controller: UpdateYoutubeUrlController;
  let updateYoutubeUrlService: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    updateYoutubeUrlService = { execute: vi.fn() };
    controller = new UpdateYoutubeUrlController(updateYoutubeUrlService as any);
  });

  it("should call service and return updated youtube url", async () => {
    updateYoutubeUrlService.execute.mockResolvedValue({
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    const dto = { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" };
    const result = await controller.handle("exercise-id", dto, mockCurrentUser);

    expect(updateYoutubeUrlService.execute).toHaveBeenCalledWith(
      "exercise-id",
      dto,
      mockCurrentUser,
    );
    expect(result).toEqual({
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  });
});
