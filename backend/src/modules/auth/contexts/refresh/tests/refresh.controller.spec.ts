import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";

import { RefreshController } from "../refresh.controller";
import { RefreshService } from "../refresh.service";

const makeRequest = (cookieHeader?: string) => ({
  headers: { cookie: cookieHeader },
});

describe("RefreshController", () => {
  let controller: RefreshController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new RefreshController(service as unknown as RefreshService);
  });

  describe("handle", () => {
    it("should return new accessToken when refresh token cookie is present", async () => {
      service.execute.mockResolvedValue({ accessToken: "new-access-token" });

      const result = await controller.handle(
        makeRequest("refreshToken=valid-token; other=value") as any,
      );

      expect(result).toEqual({ accessToken: "new-access-token" });
      expect(service.execute).toHaveBeenCalledWith("valid-token");
    });

    it("should throw UnauthorizedException when refresh token cookie is missing", async () => {
      await expect(controller.handle(makeRequest() as any)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(service.execute).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when cookie header is empty", async () => {
      await expect(controller.handle(makeRequest("") as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw when service throws UnauthorizedException", async () => {
      service.execute.mockRejectedValue(
        new UnauthorizedException("Token expirado"),
      );

      await expect(
        controller.handle(makeRequest("refreshToken=expired") as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
