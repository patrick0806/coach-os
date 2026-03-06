import { describe, it, expect, beforeEach, vi } from "vitest";

import { LogoutController } from "../logout.controller";

describe("LogoutController", () => {
  let controller: LogoutController;
  let mockReply: { header: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockReply = { header: vi.fn() };
    controller = new LogoutController();
  });

  describe("handle", () => {
    it("should clear the refreshToken cookie", () => {
      controller.handle(mockReply as any);

      expect(mockReply.header).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("refreshToken="),
      );
      expect(mockReply.header).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("Max-Age=0"),
      );
    });
  });
});
