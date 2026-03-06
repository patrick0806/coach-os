import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { SetupPasswordController } from "../setup-password.controller";
import { SetupPasswordService } from "../setup-password.service";

describe("SetupPasswordController", () => {
  let controller: SetupPasswordController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { execute: vi.fn() };
    controller = new SetupPasswordController(
      service as unknown as SetupPasswordService,
    );
  });

  describe("handle", () => {
    it("should return success message with a valid token", async () => {
      service.execute.mockResolvedValue({ message: "Senha definida com sucesso" });

      const result = await controller.handle({
        token: "raw-token",
        password: "newPassword123",
        confirmPassword: "newPassword123",
      });

      expect(result).toEqual({ message: "Senha definida com sucesso" });
      expect(service.execute).toHaveBeenCalledWith({
        token: "raw-token",
        password: "newPassword123",
        confirmPassword: "newPassword123",
      });
    });

    it("should propagate BadRequestException from service", async () => {
      service.execute.mockRejectedValue(
        new BadRequestException("Token inválido ou expirado"),
      );

      await expect(
        controller.handle({
          token: "bad-token",
          password: "newPassword123",
          confirmPassword: "newPassword123",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
