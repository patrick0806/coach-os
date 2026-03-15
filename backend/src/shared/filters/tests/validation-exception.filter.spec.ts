import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { HttpStatus } from "@nestjs/common";

import { ValidationException } from "@shared/exceptions";
import { LogBuilderService } from "@shared/providers";
import { ValidationExceptionFilter } from "../validationException.filter";

const makeMockHost = (url = "/api/test", method = "POST") => {
  const mockSend = vi.fn();
  const mockCode = vi.fn().mockReturnValue({ send: mockSend });

  return {
    mockCode,
    mockSend,
    host: {
      switchToHttp: () => ({
        getRequest: () => ({ url, method, headers: {} }),
        getResponse: () => ({ code: mockCode }),
      }),
    } as any,
  };
};

describe("ValidationExceptionFilter", () => {
  let filter: ValidationExceptionFilter;
  let buildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    filter = new ValidationExceptionFilter();
    buildSpy = vi.spyOn(LogBuilderService, "build").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("catch", () => {
    it("should respond with 400 Bad Request", () => {
      const exception = new ValidationException([{ name: "email", reason: "Email inválido" }]);
      const { mockCode, host } = makeMockHost();

      filter.catch(exception, host);

      expect(mockCode).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it("should include validation field details in the response", () => {
      const fields = [
        { name: "email", reason: "Email inválido" },
        { name: "password", reason: "Senha muito curta" },
      ];
      const exception = new ValidationException(fields);
      const { mockSend, host } = makeMockHost();

      filter.catch(exception, host);

      const responseBody = mockSend.mock.calls[0][0];
      expect(responseBody.status).toBe(HttpStatus.BAD_REQUEST);
      expect(responseBody.details).toHaveLength(1);
      expect(responseBody.details[0].additionalProperties).toEqual(fields);
    });

    it("should accept a string and wrap it in a field array", () => {
      const exception = new ValidationException("Token inválido");
      const { mockSend, host } = makeMockHost();

      filter.catch(exception, host);

      const responseBody = mockSend.mock.calls[0][0];
      expect(responseBody.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should log with 'warn' level", () => {
      const exception = new ValidationException([{ name: "id", reason: "UUID inválido" }]);
      const { host } = makeMockHost("/api/resource");

      filter.catch(exception, host);

      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "warn",
          statusCode: HttpStatus.BAD_REQUEST,
          path: "/api/resource",
        }),
      );
    });

    it("should include the request url in the response path", () => {
      const exception = new ValidationException([{ name: "name", reason: "Obrigatório" }]);
      const { mockSend, host } = makeMockHost("/api/students");

      filter.catch(exception, host);

      const responseBody = mockSend.mock.calls[0][0];
      expect(responseBody.path).toBe("/api/students");
    });
  });
});
