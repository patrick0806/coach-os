import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExecutionContext } from "@nestjs/common";

// Mock @nestjs/passport before importing JWTAuthGuard
const mockSuperCanActivate = vi.fn();
vi.mock("@nestjs/passport", () => ({
  AuthGuard: () => {
    class MockPassportGuard {
      canActivate() {
        return mockSuperCanActivate();
      }
    }
    return MockPassportGuard;
  },
}));

import { JWTAuthGuard } from "../jwtAuth.guard";

// Named functions/classes so .name property is usable as cache key
function handleA() {}
function handleB() {}
class ControllerA {}
class ControllerB {}

const makeContext = (handler: Function = handleA, classRef: Function = ControllerA) =>
  ({
    getHandler: () => handler,
    getClass: () => classRef,
  }) as unknown as ExecutionContext;

describe("JWTAuthGuard", () => {
  let guard: JWTAuthGuard;
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() };
    guard = new JWTAuthGuard(reflector as any);
    mockSuperCanActivate.mockReset();
    mockSuperCanActivate.mockReturnValue(true);
  });

  describe("canActivate", () => {
    it("should return true for routes marked as @Public() without calling AuthGuard", () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(makeContext());

      expect(result).toBe(true);
      expect(mockSuperCanActivate).not.toHaveBeenCalled();
    });

    it("should delegate to AuthGuard for non-public routes", () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      mockSuperCanActivate.mockReturnValue(true);

      const result = guard.canActivate(makeContext());

      expect(mockSuperCanActivate).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it("should return false when AuthGuard rejects the token", () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      mockSuperCanActivate.mockReturnValue(false);

      const result = guard.canActivate(makeContext());

      expect(result).toBe(false);
    });

    it("should use metadata cache and call reflector only once per handler+class", () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const context = makeContext(handleA, ControllerA);

      guard.canActivate(context);
      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
    });

    it("should call reflector again for a different handler", () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      guard.canActivate(makeContext(handleA, ControllerA));
      guard.canActivate(makeContext(handleB, ControllerB));

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
    });
  });
});
