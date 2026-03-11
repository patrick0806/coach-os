import { describe, expect, it } from "vitest";

import { ValidationException } from "@shared/exceptions";
import { validate } from "@shared/utils";

import { SetupPasswordSchema } from "../dtos/request.dto";

describe("SetupPasswordSchema", () => {
  it("should return parsed data for a valid payload", () => {
    const result = validate(SetupPasswordSchema, {
      token: "valid-token",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result).toEqual({
      token: "valid-token",
      password: "password123",
      confirmPassword: "password123",
    });
  });

  it("should collect field errors when token, password and confirmation are invalid", () => {
    const attempt = () =>
      validate(SetupPasswordSchema, {
        token: "",
        password: "123",
        confirmPassword: "",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect((error as ValidationException).fields).toEqual([
        {
          name: "token",
          reason: "Token é obrigatório",
        },
        {
          name: "password",
          reason: "Senha deve ter no mínimo 8 caracteres",
        },
        {
          name: "confirmPassword",
          reason: "Confirmação de senha é obrigatória",
        },
        {
          name: "confirmPassword",
          reason: "Senhas não coincidem",
        },
      ]);
    }
  });
});
