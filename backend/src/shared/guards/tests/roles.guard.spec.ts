import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExecutionContext } from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { RolesGuard } from "../roles.guard";

// Named functions/classes so .name property is usable as cache key
function handleA() {}
function handleB() {}
class ControllerA {}
class ControllerB {}

const makeContext = (
  userRole: ApplicationRoles,
  handler: Function = handleA,
  classRef: Function = ControllerA,
) =>
  ({
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: () => ({
      getRequest: () => ({ user: { role: userRole } }),
    }),
  }) as unknown as ExecutionContext;

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() };
    guard = new RolesGuard(reflector as any);
  });

  describe("canActivate", () => {
    it("should allow access when no roles are required", () => {
      reflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(makeContext(ApplicationRoles.STUDENT));

      expect(result).toBe(true);
    });

    it("should allow access when user has the required role", () => {
      reflector.getAllAndOverride.mockReturnValue([ApplicationRoles.PERSONAL]);

      const result = guard.canActivate(makeContext(ApplicationRoles.PERSONAL));

      expect(result).toBe(true);
    });

    it("should deny access when user does not have the required role", () => {
      reflector.getAllAndOverride.mockReturnValue([ApplicationRoles.PERSONAL]);

      const result = guard.canActivate(makeContext(ApplicationRoles.STUDENT));

      expect(result).toBe(false);
    });

    it("should allow access when user has one of multiple required roles", () => {
      reflector.getAllAndOverride.mockReturnValue([
        ApplicationRoles.PERSONAL,
        ApplicationRoles.ADMIN,
      ]);

      const result = guard.canActivate(makeContext(ApplicationRoles.ADMIN));

      expect(result).toBe(true);
    });

    it("should use cache and call reflector only once for the same handler+class", () => {
      reflector.getAllAndOverride.mockReturnValue([ApplicationRoles.PERSONAL]);
      const context = makeContext(ApplicationRoles.PERSONAL, handleA, ControllerA);

      guard.canActivate(context);
      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
    });

    it("should call reflector again for a different handler", () => {
      reflector.getAllAndOverride.mockReturnValue([ApplicationRoles.PERSONAL]);

      guard.canActivate(makeContext(ApplicationRoles.PERSONAL, handleA, ControllerA));
      guard.canActivate(makeContext(ApplicationRoles.PERSONAL, handleB, ControllerB));

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
    });
  });
});
