import { describe, expect, it } from "vitest";

import { ValidationException } from "@shared/exceptions";
import { validate } from "@shared/utils";

import { RegisterRequestSchema } from "../dtos";

describe("RegisterRequestSchema", () => {
  it("should return parsed data for a valid payload", () => {
    const result = validate(RegisterRequestSchema, {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result).toEqual({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
  });

  it("should map confirmPassword mismatch to a field validation error", () => {
    const attempt = () =>
      validate(RegisterRequestSchema, {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "different-password",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect((error as ValidationException).fields).toEqual([
        {
          name: "confirmPassword",
          reason: "As senhas não coincidem",
        },
      ]);
    }
  });

  it("should collect multiple field errors for malformed payloads", () => {
    const attempt = () =>
      validate(RegisterRequestSchema, {
        name: "J",
        email: "invalid-email",
        password: "123",
        confirmPassword: "456",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect((error as ValidationException).fields).toEqual([
        {
          name: "name",
          reason: "Nome deve ter pelo menos 2 caracteres",
        },
        {
          name: "email",
          reason: "E-mail inválido",
        },
        {
          name: "password",
          reason: "Senha deve ter pelo menos 8 caracteres",
        },
        {
          name: "confirmPassword",
          reason: "As senhas não coincidem",
        },
      ]);
    }
  });
});
