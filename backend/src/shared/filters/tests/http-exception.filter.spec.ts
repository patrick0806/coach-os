import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { HttpException, HttpStatus } from "@nestjs/common";

import { LogBuilderService } from "@shared/providers";
import { HttpExceptionFilter } from "../httpException.filter";

const makeMockHost = (overrides: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  statusCode?: number;
  startTime?: number;
}) => {
  const { url = "/api/test", method = "GET", headers = {}, startTime } = overrides;
  const mockSend = vi.fn();
  const mockCode = vi.fn().mockReturnValue({ send: mockSend });

  return {
    mockCode,
    mockSend,
    host: {
      switchToHttp: () => ({
        getRequest: () => ({
          url,
          method,
          headers,
          startTime,
        }),
        getResponse: () => ({
          code: mockCode,
        }),
      }),
    } as any,
  };
};

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;
  let buildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    buildSpy = vi.spyOn(LogBuilderService, "build").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("catch", () => {
    it("should respond with the exception status code and error format", () => {
      const exception = new HttpException("Recurso não encontrado", HttpStatus.NOT_FOUND);
      const { mockCode, mockSend, host } = makeMockHost({ url: "/api/users/999" });

      filter.catch(exception as any, host);

      expect(mockCode).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockSend).toHaveBeenCalledOnce();

      const responseBody = mockSend.mock.calls[0][0];
      expect(responseBody.status).toBe(HttpStatus.NOT_FOUND);
      expect(responseBody.path).toBe("/api/users/999");
      expect(responseBody.timestamp).toBeDefined();
    });

    it("should log with 'warn' level for 4xx errors", () => {
      const exception = new HttpException("Proibido", HttpStatus.FORBIDDEN);
      const { host } = makeMockHost({});

      filter.catch(exception as any, host);

      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({ level: "warn", statusCode: HttpStatus.FORBIDDEN }),
      );
    });

    it("should log with 'error' level for 500 internal server error", () => {
      const exception = new HttpException(
        "Erro interno",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      const { host } = makeMockHost({});

      filter.catch(exception as any, host);

      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({ level: "error", statusCode: HttpStatus.INTERNAL_SERVER_ERROR }),
      );
    });

    it("should include transactionId from request headers when present", () => {
      const exception = new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
      // getHeader splits by space and returns index 1 (e.g. "Bearer txn-abc" → "txn-abc")
      const { mockSend, host } = makeMockHost({
        headers: { transactionId: "Bearer txn-abc-123" },
      });

      filter.catch(exception as any, host);

      const responseBody = mockSend.mock.calls[0][0];
      expect(responseBody.transactionId).toBe("txn-abc-123");
    });

    it("should set transactionId as null when header is absent", () => {
      const exception = new HttpException("Not Found", HttpStatus.NOT_FOUND);
      const { mockSend, host } = makeMockHost({ headers: {} });

      filter.catch(exception as any, host);

      const responseBody = mockSend.mock.calls[0][0];
      expect(responseBody.transactionId).toBeNull();
    });
  });
});
