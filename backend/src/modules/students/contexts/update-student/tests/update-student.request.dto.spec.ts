import { describe, expect, it } from "vitest";

import { ValidationException } from "@shared/exceptions";
import { validate } from "@shared/utils";

import { UpdateStudentSchema } from "../dtos/request.dto";

describe("UpdateStudentSchema", () => {
  it("should accept a payload when at least one updatable field is present", () => {
    const result = validate(UpdateStudentSchema, {
      email: "student@example.com",
    });

    expect(result).toEqual({
      email: "student@example.com",
    });
  });

  it("should map empty payload errors to body and preserve field-level issues", () => {
    const attempt = () =>
      validate(UpdateStudentSchema, {
        email: "invalid-email",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect((error as ValidationException).fields).toEqual([
        {
          name: "email",
          reason: "E-mail inválido",
        },
      ]);
    }
  });

  it("should raise a body-level validation error when no fields are provided", () => {
    const attempt = () => validate(UpdateStudentSchema, {});

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect((error as ValidationException).fields).toEqual([
        {
          name: "body",
          reason: "Informe ao menos um campo para atualizar",
        },
      ]);
    }
  });
});
