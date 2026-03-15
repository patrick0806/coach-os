import { describe, it, expect, beforeEach, vi } from "vitest";
import { HttpStatus, ArgumentsHost } from "@nestjs/common";

import { AllExceptionsFilter } from "../allExceptions.filter";
import { LogBuilderService } from "@shared/providers";
import { getHeader, getRequestDuration } from "@shared/utils";
import { HEADERS } from "@shared/constants";

vi.mock("@shared/providers", () => ({
    LogBuilderService: {
        build: vi.fn(),
    },
}));

vi.mock("@shared/utils", () => ({
    getHeader: vi.fn(),
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
        };

        reply = {
            code: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };

        (getHeader as any).mockReturnValue("tx-123");
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
                transactionId: "tx-123",
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
                transactionId: "tx-123",
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

    it("should read transaction id header", () => {
        filter.catch(new Error("boom"), createHost());

        expect(getHeader).toHaveBeenCalledWith(
            request.headers,
            HEADERS.TRANSACTION_ID,
        );
    });

    it("should calculate request duration", () => {
        filter.catch(new Error("boom"), createHost());

        expect(getRequestDuration).toHaveBeenCalledWith(request);
    });
});