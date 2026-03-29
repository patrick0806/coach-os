import { describe, it, expect, beforeEach, vi } from "vitest";
import { HttpStatus, ArgumentsHost } from "@nestjs/common";

import { AllExceptionsFilter } from "../allExceptions.filter";
import { LogBuilderService } from "@shared/providers";
import { getRequestDuration } from "@shared/utils";

vi.mock("@shared/providers", () => ({
    LogBuilderService: {
        build: vi.fn(),
    },
}));

vi.mock("@shared/utils", () => ({
    getRequestContext: vi.fn().mockReturnValue({
        correlationId: "corr-123",
        userId: "user-1",
        tenantId: "tenant-1",
    }),
    getRequestDuration: vi.fn(),
}));

describe("AllExceptionsFilter", () => {
    let filter: AllExceptionsFilter;

    let request: any;
    let reply: any;

    beforeEach(() => {
        filter = new AllExceptionsFilter();

        request = {
            url: "/test",
            method: "GET",
            headers: {},
            correlationId: "corr-123",
        };

        reply = {
            code: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };

        (getRequestDuration as any).mockReturnValue(120);
    });

    const createHost = (): ArgumentsHost =>
        ({
            switchToHttp: () => ({
                getRequest: () => request,
                getResponse: () => reply,
            }),
        }) as unknown as ArgumentsHost;

    it("should handle Error exceptions correctly", () => {
        const error = new Error("boom");

        filter.catch(error, createHost());

        expect(LogBuilderService.build).toHaveBeenCalledWith(
            expect.objectContaining({
                level: "error",
                message: "boom",
                method: "GET",
                path: "/test",
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                correlationId: "corr-123",
                userId: "user-1",
                tenantId: "tenant-1",
                duration: 120,
                error,
            }),
        );

        expect(reply.code).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: "Internal Server Error",
                path: "/test",
                correlationId: "corr-123",
                message: "boom",
            }),
        );
    });

    it("should handle non Error exceptions", () => {
        filter.catch("string error", createHost());

        expect(LogBuilderService.build).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Internal server error",
                error: expect.any(Error),
            }),
        );

        expect(reply.send).toHaveBeenCalled();
    });

    it("should calculate request duration", () => {
        filter.catch(new Error("boom"), createHost());

        expect(getRequestDuration).toHaveBeenCalledWith(request);
    });
});
