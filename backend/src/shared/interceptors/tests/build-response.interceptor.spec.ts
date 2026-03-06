import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ExecutionContext } from "@nestjs/common";
import { firstValueFrom, of } from "rxjs";

import { LogBuilderService } from "@shared/providers";
import { BuildResponseInterceptor } from "../buildResponse.interceptor";

const makeContext = (url = "/api/test", method = "GET") => {
  const mockRequest: Record<string, any> = { url, method, headers: {} };

  return {
    mockRequest,
    context: {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext,
  };
};

const makeCallHandler = (responseData: any) => ({
  handle: () => of(responseData),
});

describe("BuildResponseInterceptor", () => {
  let interceptor: BuildResponseInterceptor;
  let buildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    interceptor = new BuildResponseInterceptor();
    buildSpy = vi.spyOn(LogBuilderService, "build").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("intercept", () => {
    it("should set startTime on the request object", async () => {
      const { mockRequest, context } = makeContext();
      const handler = makeCallHandler({ data: "ok" });

      const before = Date.now();
      const stream$ = await interceptor.intercept(context, handler);
      await firstValueFrom(stream$);

      expect(mockRequest.startTime).toBeGreaterThanOrEqual(before);
    });

    it("should return params directly when there is no data wrapper", async () => {
      const payload = { id: "1", name: "Test" };
      const { context } = makeContext();
      const handler = makeCallHandler(payload);

      const stream$ = await interceptor.intercept(context, handler);
      const result = await firstValueFrom(stream$);

      expect(result).toEqual(payload);
    });

    it("should return params.data when the response has a data wrapper", async () => {
      const payload = { data: { id: "1", name: "Test" }, message: "OK" };
      const { context } = makeContext();
      const handler = makeCallHandler(payload);

      const stream$ = await interceptor.intercept(context, handler);
      const result = await firstValueFrom(stream$);

      expect(result).toEqual({ id: "1", name: "Test" });
    });

    it("should log the request for non-health endpoints", async () => {
      const { context } = makeContext("/api/users", "GET");
      const handler = makeCallHandler({ id: "1" });

      const stream$ = await interceptor.intercept(context, handler);
      await firstValueFrom(stream$);

      expect(buildSpy).toHaveBeenCalledOnce();
      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({ level: "info", method: "GET", path: "/api/users" }),
      );
    });

    it("should skip logging for health check endpoints", async () => {
      const { context } = makeContext("/health", "GET");
      const handler = makeCallHandler({ status: "ok" });

      const stream$ = await interceptor.intercept(context, handler);
      await firstValueFrom(stream$);

      expect(buildSpy).not.toHaveBeenCalled();
    });

    it("should use params.message in the log when present", async () => {
      const { context } = makeContext("/api/students");
      const handler = makeCallHandler({ message: "Student created" });

      const stream$ = await interceptor.intercept(context, handler);
      await firstValueFrom(stream$);

      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Student created" }),
      );
    });

    it("should use default message when params.message is absent", async () => {
      const { context } = makeContext("/api/exercises");
      const handler = makeCallHandler([{ id: "1" }]);

      const stream$ = await interceptor.intercept(context, handler);
      await firstValueFrom(stream$);

      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Request completed successfully" }),
      );
    });
  });
});
