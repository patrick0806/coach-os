import { describe, expect, it } from "vitest";

import { ValidationException } from "@shared/exceptions";
import { validate } from "@shared/utils";

import { UpdateYoutubeUrlSchema } from "../dtos/request.dto";

describe("UpdateYoutubeUrlSchema", () => {
  it("should accept youtube links and null values", () => {
    expect(
      validate(UpdateYoutubeUrlSchema, {
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      }),
    ).toEqual({
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    expect(
      validate(UpdateYoutubeUrlSchema, {
        youtubeUrl: null,
      }),
    ).toEqual({
      youtubeUrl: null,
    });
  });

  it("should reject non-youtube domains even when the url is syntactically valid", () => {
    const attempt = () =>
      validate(UpdateYoutubeUrlSchema, {
        youtubeUrl: "https://vimeo.com/123456",
      });

    expect(attempt).toThrowError(ValidationException);

    try {
      attempt();
    } catch (error) {
      expect((error as ValidationException).fields).toEqual([
        {
          name: "youtubeUrl",
          reason: "Apenas links do YouTube sao aceitos (youtube.com ou youtu.be)",
        },
      ]);
    }
  });
});
