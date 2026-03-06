import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { RefreshService } from "../refresh.service";

const makeUser = (overrides = {}) => ({
  id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  password: "hashed",
  role: ApplicationRoles.PERSONAL,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockPayload = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  profileId: "personal-id",
  personalId: "personal-id",
  personalSlug: "john-doe",
};

describe("RefreshService", () => {
  let service: RefreshService;
  let usersRepository: { findById: ReturnType<typeof vi.fn> };
  let authTokenService: {
    verifyRefreshToken: ReturnType<typeof vi.fn>;
    buildPayload: ReturnType<typeof vi.fn>;
    signAccessToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersRepository = { findById: vi.fn() };
    authTokenService = {
      verifyRefreshToken: vi.fn(),
      buildPayload: vi.fn(),
      signAccessToken: vi.fn(),
    };

    service = new RefreshService(
      usersRepository as any,
      authTokenService as any,
    );
  });

  describe("execute", () => {
    it("should return a new accessToken with a valid refresh token", async () => {
      authTokenService.verifyRefreshToken.mockReturnValue({ sub: "user-id" });
      usersRepository.findById.mockResolvedValue(makeUser());
      authTokenService.buildPayload.mockResolvedValue(mockPayload);
      authTokenService.signAccessToken.mockReturnValue("new-access-token");

      const result = await service.execute("valid-refresh-token");

      expect(result).toEqual({ accessToken: "new-access-token" });
      expect(authTokenService.verifyRefreshToken).toHaveBeenCalledWith(
        "valid-refresh-token",
      );
    });

    it("should throw UnauthorizedException when refresh token is invalid", async () => {
      authTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("jwt expired");
      });

      await expect(service.execute("expired-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when user is not found", async () => {
      authTokenService.verifyRefreshToken.mockReturnValue({ sub: "user-id" });
      usersRepository.findById.mockResolvedValue(null);

      await expect(service.execute("valid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when user is inactive", async () => {
      authTokenService.verifyRefreshToken.mockReturnValue({ sub: "user-id" });
      usersRepository.findById.mockResolvedValue(makeUser({ isActive: false }));

      await expect(service.execute("valid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
