import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { LoginController } from "../login.controller";
import { LoginService } from "../login.service";

const mockReply = {
  header: vi.fn(),
};

const mockServiceResult = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  role: ApplicationRoles.PERSONAL,
  personalSlug: "john-doe",
};

describe("LoginController", () => {
  let controller: LoginController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    service = { execute: vi.fn() };
    controller = new LoginController(service as unknown as LoginService);
  });

  describe("handle", () => {
    it("should return accessToken and set refreshToken cookie on successful login", async () => {
      service.execute.mockResolvedValue(mockServiceResult);

      const result = await controller.handle(
        { email: "john@example.com", password: "password123" },
        mockReply as any,
      );

      expect(result).toEqual({
        accessToken: "access-token",
        role: ApplicationRoles.PERSONAL,
        personalSlug: "john-doe",
      });

      expect(mockReply.header).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("refreshToken=refresh-token"),
      );
      expect(mockReply.header).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("HttpOnly"),
      );
    });

    it("should throw UnauthorizedException when credentials are invalid", async () => {
      service.execute.mockRejectedValue(
        new UnauthorizedException("Credenciais inválidas"),
      );

      await expect(
        controller.handle(
          { email: "john@example.com", password: "wrong" },
          mockReply as any,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw ValidationException when email is invalid", async () => {
      await expect(
        controller.handle(
          { email: "not-an-email", password: "password123" },
          mockReply as any,
        ),
      ).rejects.toThrow();

      expect(service.execute).not.toHaveBeenCalled();
    });

    it("should throw ValidationException when password is missing", async () => {
      await expect(
        controller.handle(
          { email: "john@example.com", password: "" },
          mockReply as any,
        ),
      ).rejects.toThrow();

      expect(service.execute).not.toHaveBeenCalled();
    });
  });
});
