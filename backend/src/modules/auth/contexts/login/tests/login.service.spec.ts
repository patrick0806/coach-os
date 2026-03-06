import { describe, it, expect, beforeEach, vi } from "vitest";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { LoginService } from "../login.service";

vi.mock("argon2", () => ({
  verify: vi.fn(),
  argon2id: 2,
}));

import * as argon2 from "argon2";

const makeUser = (overrides = {}) => ({
  id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  password: "hashed-password",
  role: ApplicationRoles.PERSONAL,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockPersonalPayload = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  profileId: "personal-id",
  personalId: "personal-id",
  personalSlug: "john-doe",
};

describe("LoginService", () => {
  let service: LoginService;
  let usersRepository: { findByEmail: ReturnType<typeof vi.fn> };
  let authTokenService: {
    buildPayload: ReturnType<typeof vi.fn>;
    signAccessToken: ReturnType<typeof vi.fn>;
    signRefreshToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    usersRepository = { findByEmail: vi.fn() };
    authTokenService = {
      buildPayload: vi.fn(),
      signAccessToken: vi.fn(),
      signRefreshToken: vi.fn(),
    };

    service = new LoginService(
      usersRepository as any,
      authTokenService as any,
    );
  });

  describe("execute", () => {
    it("should login a personal trainer successfully", async () => {
      const user = makeUser({ role: ApplicationRoles.PERSONAL });
      usersRepository.findByEmail.mockResolvedValue(user);
      vi.mocked(argon2.verify).mockResolvedValue(true);
      authTokenService.buildPayload.mockResolvedValue(mockPersonalPayload);
      authTokenService.signAccessToken.mockReturnValue("access-token");
      authTokenService.signRefreshToken.mockReturnValue("refresh-token");

      const result = await service.execute({
        email: "john@example.com",
        password: "password123",
      });

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        role: ApplicationRoles.PERSONAL,
        personalSlug: "john-doe",
      });
      expect(authTokenService.buildPayload).toHaveBeenCalledWith(user);
    });

    it("should login a student successfully", async () => {
      const user = makeUser({ role: ApplicationRoles.STUDENT });
      const studentPayload = {
        sub: "user-id",
        role: ApplicationRoles.STUDENT,
        profileId: "student-id",
        personalId: "personal-id",
        personalSlug: "coach-slug",
      };

      usersRepository.findByEmail.mockResolvedValue(user);
      vi.mocked(argon2.verify).mockResolvedValue(true);
      authTokenService.buildPayload.mockResolvedValue(studentPayload);
      authTokenService.signAccessToken.mockReturnValue("access-token");
      authTokenService.signRefreshToken.mockReturnValue("refresh-token");

      const result = await service.execute({
        email: "student@example.com",
        password: "password123",
      });

      expect(result.role).toBe(ApplicationRoles.STUDENT);
      expect(result.personalSlug).toBe("coach-slug");
    });

    it("should login an admin successfully", async () => {
      const user = makeUser({ role: ApplicationRoles.ADMIN });
      const adminPayload = {
        sub: "user-id",
        role: ApplicationRoles.ADMIN,
        profileId: "admin-id",
        personalId: null,
        personalSlug: null,
      };

      usersRepository.findByEmail.mockResolvedValue(user);
      vi.mocked(argon2.verify).mockResolvedValue(true);
      authTokenService.buildPayload.mockResolvedValue(adminPayload);
      authTokenService.signAccessToken.mockReturnValue("access-token");
      authTokenService.signRefreshToken.mockReturnValue("refresh-token");

      const result = await service.execute({
        email: "admin@example.com",
        password: "password123",
      });

      expect(result.role).toBe(ApplicationRoles.ADMIN);
      expect(result.personalSlug).toBeNull();
    });

    it("should throw UnauthorizedException when email is not found", async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.execute({ email: "notfound@example.com", password: "any" }),
      ).rejects.toThrow(UnauthorizedException);

      expect(authTokenService.buildPayload).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when password is wrong", async () => {
      usersRepository.findByEmail.mockResolvedValue(makeUser());
      vi.mocked(argon2.verify).mockResolvedValue(false);

      await expect(
        service.execute({ email: "john@example.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);

      expect(authTokenService.buildPayload).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException when account is inactive", async () => {
      usersRepository.findByEmail.mockResolvedValue(
        makeUser({ isActive: false }),
      );
      vi.mocked(argon2.verify).mockResolvedValue(true);

      await expect(
        service.execute({ email: "john@example.com", password: "password123" }),
      ).rejects.toThrow(ForbiddenException);

      expect(authTokenService.buildPayload).not.toHaveBeenCalled();
    });
  });
});
