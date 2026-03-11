import { describe, expect, it } from "vitest";

import { ValidationException } from "@shared/exceptions";
import { validate } from "@shared/utils";

import { CheckoutSchema } from "../dtos/request.dto";

describe("CheckoutSchema", () => {
  it("should return parsed data for a valid plan id", () => {
    const result = validate(CheckoutSchema, {
      planId: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result).toEqual({
      planId: "550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("should reject invalid uuid payloads", () => {
    const attempt = () =>
      validate(CheckoutSchema, {
        planId: "not-a-uuid",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect((error as ValidationException).fields).toEqual([
        {
          name: "planId",
          reason: "planId deve ser um UUID válido",
        },
      ]);
    }
  });
});
