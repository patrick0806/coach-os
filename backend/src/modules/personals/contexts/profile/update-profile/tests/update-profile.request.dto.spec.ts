import { describe, expect, it } from "vitest";

import { ValidationException } from "@shared/exceptions";
import { validate } from "@shared/utils";

import { UpdateProfileSchema } from "../dtos/request.dto";

describe("UpdateProfileSchema", () => {
  it("should return parsed data for a valid partial update", () => {
    const result = validate(UpdateProfileSchema, {
      bio: "Nova bio",
      themeColor: "#10b981",
      profilePhoto: "https://example.com/profile.jpg",
    });

    expect(result).toEqual({
      bio: "Nova bio",
      themeColor: "#10b981",
      profilePhoto: "https://example.com/profile.jpg",
    });
  });

  it("should collect multiple field errors for invalid URLs and theme color", () => {
    const attempt = () =>
      validate(UpdateProfileSchema, {
        themeColor: "verde",
        profilePhoto: "not-a-url",
        lpHeroImage: "still-not-a-url",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect((error as ValidationException).fields).toEqual([
        {
          name: "themeColor",
          reason: "Cor inválida — use formato hex (#RRGGBB)",
        },
        {
          name: "profilePhoto",
          reason: "URL inválida",
        },
        {
          name: "lpHeroImage",
          reason: "URL inválida",
        },
      ]);
    }
  });
});
