import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConflictException } from "@nestjs/common";

import { RegisterController } from "../register.controller";
import { RegisterService } from "../register.service";

const mockServiceResponse = {
  id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  role: "PERSONAL",
  profile: {
    id: "personal-id",
    slug: "john-doe",
  },
};

describe("RegisterController", () => {
  let controller: RegisterController;
  let service: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = {
      execute: vi.fn(),
    };

    controller = new RegisterController(service as unknown as RegisterService);
  });

  describe("handle", () => {
    it("should return registered user data on successful registration", async () => {
      const body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      service.execute.mockResolvedValue(mockServiceResponse);

      const result = await controller.handle(body);

      expect(result).toEqual(mockServiceResponse);
      expect(service.execute).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
    });

    it("should throw ConflictException when email is already in use", async () => {
      const body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      service.execute.mockRejectedValue(
        new ConflictException("E-mail já está em uso"),
      );

      await expect(controller.handle(body)).rejects.toThrow(ConflictException);
    });

    it("should throw ValidationException when passwords do not match", async () => {
      const body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "different-password",
      };

      await expect(controller.handle(body)).rejects.toThrow();
      expect(service.execute).not.toHaveBeenCalled();
    });

    it("should throw ValidationException when password is shorter than 8 characters", async () => {
      const body = {
        name: "John Doe",
        email: "john@example.com",
        password: "short",
        confirmPassword: "short",
      };

      await expect(controller.handle(body)).rejects.toThrow();
      expect(service.execute).not.toHaveBeenCalled();
    });

    it("should throw ValidationException when email is invalid", async () => {
      const body = {
        name: "John Doe",
        email: "not-an-email",
        password: "password123",
        confirmPassword: "password123",
      };

      await expect(controller.handle(body)).rejects.toThrow();
      expect(service.execute).not.toHaveBeenCalled();
    });
  });
});
