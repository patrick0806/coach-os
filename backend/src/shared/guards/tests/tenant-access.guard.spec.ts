import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExecutionContext } from "@nestjs/common";

import { BYPASS_TENANT_ACCESS_KEY } from "@shared/decorators/bypass-tenant-access.decorator";
import { IS_PUBLIC_KEY } from "@shared/decorators/public.decorator";
import { ApplicationRoles } from "@shared/enums";
import { Personal } from "@config/database/schema/personals";
import { TenantAccessGuard } from "../tenant-access.guard";

function handleA() { }
function handleB() { }
class ControllerA { }
class ControllerB { }

const makeContext = (
  user: { role: ApplicationRoles; personalId: string | null } | null,
  handler: Function = handleA,
  classRef: Function = ControllerA,
) =>
  ({
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

const makePersonal = (
  overrides: Partial<Personal> = {},
): Personal => ({
  id: "personal-id",
  userId: "user-id",
  slug: "coach-slug",
  bio: null,
  profilePhoto: null,
  themeColor: "#10b981",
  phoneNumber: null,
  lpTitle: null,
  lpSubtitle: null,
  lpHeroImage: null,
  lpAboutTitle: null,
  lpAboutText: null,
  lpImage1: null,
  lpImage2: null,
  lpImage3: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: null,
  subscriptionPlanId: null,
  subscriptionExpiresAt: null,
  trialStartedAt: new Date("2026-03-01T00:00:00.000Z"),
  trialEndsAt: new Date("2026-04-01T00:00:00.000Z"),
  accessStatus: "trialing",
  createdAt: new Date("2026-03-01T00:00:00.000Z"),
  updatedAt: new Date("2026-03-01T00:00:00.000Z"),
  ...overrides,
});

describe("TenantAccessGuard", () => {
  let guard: TenantAccessGuard;
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };
  let personalsRepository: {
    findById: ReturnType<typeof vi.fn>;
    updateSubscription: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn((key: string) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === BYPASS_TENANT_ACCESS_KEY) return false;
        return undefined;
      }),
    };

    personalsRepository = {
      findById: vi.fn(),
      updateSubscription: vi.fn().mockResolvedValue(undefined),
    };

    guard = new TenantAccessGuard(reflector as any, personalsRepository as any);
  });

  it("should allow public routes without checking tenant", async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === IS_PUBLIC_KEY);

    const result = await guard.canActivate(makeContext(null));

    expect(result).toBe(true);
    expect(personalsRepository.findById).not.toHaveBeenCalled();
  });

  it("should allow routes marked with @BypassTenantAccess", async () => {
    reflector.getAllAndOverride.mockImplementation(
      (key: string) => key === BYPASS_TENANT_ACCESS_KEY,
    );

    const result = await guard.canActivate(
      makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
    );

    expect(result).toBe(true);
    expect(personalsRepository.findById).not.toHaveBeenCalled();
  });

  it("should allow ADMIN role", async () => {
    const result = await guard.canActivate(
      makeContext({ role: ApplicationRoles.ADMIN, personalId: null }),
    );

    expect(result).toBe(true);
    expect(personalsRepository.findById).not.toHaveBeenCalled();
  });

  it("should block PERSONAL when trial has expired", async () => {
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        accessStatus: "trialing",
        trialEndsAt: new Date("2026-02-01T00:00:00.000Z"),
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
      ),
    ).rejects.toMatchObject({
      error: "tenant_blocked",
      code: "trial_expired",
    });

    expect(personalsRepository.updateSubscription).toHaveBeenCalledWith("personal-id", {
      accessStatus: "expired",
    });
  });

  it("should block STUDENT when personal is past_due", async () => {
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        accessStatus: "past_due",
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.STUDENT, personalId: "personal-id" }),
      ),
    ).rejects.toMatchObject({
      error: "tenant_blocked",
      code: "payment_required",
    });
  });

  it("should block paid subscriptions with inactive status", async () => {
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        subscriptionPlanId: "plan-id",
        subscriptionStatus: "canceled",
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
      ),
    ).rejects.toMatchObject({
      error: "tenant_blocked",
      code: "subscription_inactive",
    });
  });

  it("should allow paid subscriptions with active status", async () => {
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        accessStatus: "trialing",
        subscriptionPlanId: "plan-id",
        subscriptionStatus: "active",
      }),
    );

    const result = await guard.canActivate(
      makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
    );

    expect(result).toBe(true);
    expect(personalsRepository.updateSubscription).toHaveBeenCalledWith("personal-id", {
      accessStatus: "active",
    });
  });

  it("deve priorizar subscriptionStatus (Stripe) sobre accessStatus desatualizado", async () => {
    // Divergência: Stripe já atualizou para "active" mas accessStatus ainda está como "expired"
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        accessStatus: "expired",
        subscriptionPlanId: "plan-id",
        subscriptionStatus: "active",
      }),
    );

    const result = await guard.canActivate(
      makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
    );

    // Com Stripe ativo, o acesso deve ser liberado mesmo que accessStatus esteja desatualizado
    expect(result).toBe(true);
  });

  it("deve sincronizar accessStatus de forma não-bloqueante (fire-and-forget)", async () => {
    // O guard não deve aguardar o write de sincronização para responder
    let resolveUpdate!: () => void;
    personalsRepository.updateSubscription.mockReturnValue(
      new Promise<void>((resolve) => { resolveUpdate = resolve; }),
    );
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        accessStatus: "trialing",
        subscriptionPlanId: "plan-id",
        subscriptionStatus: "active",
      }),
    );

    // canActivate deve resolver IMEDIATAMENTE sem esperar o updateSubscription
    const resultPromise = guard.canActivate(
      makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
    );

    // Resolve antes do updateSubscription terminar
    const result = await resultPromise;
    expect(result).toBe(true);

    // Agora resolve o update para não vazar promises
    resolveUpdate();
  });

  it("should use route metadata cache and avoid repeated reflector reads", async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === IS_PUBLIC_KEY);

    await guard.canActivate(makeContext(null, handleA, ControllerA));
    await guard.canActivate(makeContext(null, handleA, ControllerA));
    await guard.canActivate(makeContext(null, handleB, ControllerB));

    expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(4);
  });

  it("should block when user has no personalId", async () => {
    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.PERSONAL, personalId: null }),
      ),
    ).rejects.toMatchObject({
      code: "subscription_inactive",
    });
  });

  it("should block when personal is not found", async () => {
    personalsRepository.findById.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
      ),
    ).rejects.toMatchObject({
      code: "subscription_inactive",
    });
  });

  it("should block when stripe status is past_due", async () => {
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        subscriptionStatus: "past_due",
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
      ),
    ).rejects.toMatchObject({
      code: "payment_required",
    });
  });

  it("should block unknown stripe statuses", async () => {
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        subscriptionStatus: "weird_status",
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
      ),
    ).rejects.toMatchObject({
      code: "subscription_inactive",
    });
  });

  it("should allow other roles", async () => {
    const result = await guard.canActivate(
      makeContext({ role: "OTHER" as any, personalId: null }),
    );

    expect(result).toBe(true);
  });

  it("should block unknown stripe subscription status", async () => {
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        subscriptionPlanId: "plan",
        subscriptionStatus: "weird_status" as any,
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
      ),
    ).rejects.toMatchObject({
      code: "subscription_inactive",
    });
  });

  it("should block when stripe subscription is past_due", async () => {
    personalsRepository.findById.mockResolvedValue(
      makePersonal({
        subscriptionPlanId: "plan",
        subscriptionStatus: "past_due",
      }),
    );

    await expect(
      guard.canActivate(
        makeContext({ role: ApplicationRoles.PERSONAL, personalId: "personal-id" }),
      ),
    ).rejects.toMatchObject({
      code: "payment_required",
    });
  });
});
