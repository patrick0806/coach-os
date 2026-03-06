import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { SetupPasswordService } from "../setup-password.service";

vi.mock("argon2", () => ({
  hash: vi.fn().mockResolvedValue("hashed-password"),
  argon2id: 2,
}));

const mockToken = {
  id: "token-id",
  userId: "user-id",
  tokenHash: "abc123hash",
  expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  usedAt: null,
  createdAt: new Date(),
};

describe("SetupPasswordService", () => {
  let service: SetupPasswordService;
  let passwordSetupTokensRepository: {
    findValidByTokenHash: ReturnType<typeof vi.fn>;
    markAsUsed: ReturnType<typeof vi.fn>;
  };
  let usersRepository: {
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    passwordSetupTokensRepository = {
      findValidByTokenHash: vi.fn(),
      markAsUsed: vi.fn(),
    };
    usersRepository = {
      update: vi.fn(),
    };

    service = new SetupPasswordService(
      passwordSetupTokensRepository as any,
      usersRepository as any,
    );
  });

  describe("execute", () => {
    it("should set password successfully with a valid token", async () => {
      passwordSetupTokensRepository.findValidByTokenHash.mockResolvedValue(
        mockToken,
      );
      usersRepository.update.mockResolvedValue({ id: "user-id" });
      passwordSetupTokensRepository.markAsUsed.mockResolvedValue(undefined);

      const result = await service.execute({
        token: "raw-token",
        password: "newPassword123",
        confirmPassword: "newPassword123",
      });

      expect(result).toEqual({ message: "Senha definida com sucesso" });
      expect(usersRepository.update).toHaveBeenCalledWith("user-id", {
        password: "hashed-password",
      });
      expect(passwordSetupTokensRepository.markAsUsed).toHaveBeenCalledWith(
        "token-id",
      );
    });

    it("should throw BadRequestException when token is invalid or expired", async () => {
      passwordSetupTokensRepository.findValidByTokenHash.mockResolvedValue(null);

      await expect(
        service.execute({
          token: "invalid-token",
          password: "newPassword123",
          confirmPassword: "newPassword123",
        }),
      ).rejects.toThrow(BadRequestException);

      expect(usersRepository.update).not.toHaveBeenCalled();
      expect(passwordSetupTokensRepository.markAsUsed).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when passwords do not match", async () => {
      await expect(
        service.execute({
          token: "raw-token",
          password: "password123",
          confirmPassword: "different456",
        }),
      ).rejects.toThrow(BadRequestException);

      expect(
        passwordSetupTokensRepository.findValidByTokenHash,
      ).not.toHaveBeenCalled();
    });
  });
});
