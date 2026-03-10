import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { BYPASS_TENANT_ACCESS_KEY } from "@shared/decorators/bypass-tenant-access.decorator";
import { IS_PUBLIC_KEY } from "@shared/decorators/public.decorator";
import { ApplicationRoles } from "@shared/enums";
import { TenantBlockedCode, TenantBlockedException } from "@shared/exceptions";
import { IAccessToken } from "@shared/interfaces";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { Personal } from "@config/database/schema/personals";

type NormalizedAccessStatus = "trialing" | "active" | "past_due" | "expired" | "canceled";

type BlockResult =
  | { code: TenantBlockedCode; normalizedStatus: NormalizedAccessStatus }
  | { code: null; normalizedStatus: NormalizedAccessStatus | null };

const PAYMENT_REQUIRED_SUBSCRIPTION_STATUSES = new Set(["past_due", "unpaid"]);
const INACTIVE_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete", "incomplete_expired"]);
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

const TENANT_BLOCK_MESSAGES: Record<TenantBlockedCode, string> = {
  trial_expired: "Seu período de avaliação expirou. Regularize sua assinatura para continuar.",
  payment_required: "Pagamento pendente. Regularize sua assinatura para continuar.",
  subscription_inactive: "Sua assinatura está inativa. Regularize para continuar usando a plataforma.",
};

@Injectable()
export class TenantAccessGuard implements CanActivate {
  private metadataCache = new Map<string, boolean>();

  constructor(
    private readonly reflector: Reflector,
    private readonly personalsRepository: PersonalsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isBypassed(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: IAccessToken }>();
    const user = request.user;

    if (!user) {
      return true;
    }

    if (user.role === ApplicationRoles.ADMIN) {
      return true;
    }

    if (user.role !== ApplicationRoles.PERSONAL && user.role !== ApplicationRoles.STUDENT) {
      return true;
    }

    if (!user.personalId) {
      throw new TenantBlockedException(
        "subscription_inactive",
        TENANT_BLOCK_MESSAGES.subscription_inactive,
      );
    }

    const personal = await this.personalsRepository.findById(user.personalId);
    if (!personal) {
      throw new TenantBlockedException(
        "subscription_inactive",
        TENANT_BLOCK_MESSAGES.subscription_inactive,
      );
    }

    const blockResult = this.resolveBlockReason(personal);

    if (blockResult.normalizedStatus && personal.accessStatus !== blockResult.normalizedStatus) {
      await this.personalsRepository.updateSubscription(personal.id, {
        accessStatus: blockResult.normalizedStatus,
      });
    }

    if (blockResult.code) {
      throw new TenantBlockedException(
        blockResult.code,
        TENANT_BLOCK_MESSAGES[blockResult.code],
      );
    }

    return true;
  }

  private isBypassed(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const classRef = context.getClass();
    const cacheKey = `${classRef.name}_${handler.name}`;

    let isBypassed = this.metadataCache.get(cacheKey);
    if (isBypassed !== undefined) {
      return isBypassed;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      classRef,
    ]);
    const bypassTenantAccess = this.reflector.getAllAndOverride<boolean>(
      BYPASS_TENANT_ACCESS_KEY,
      [handler, classRef],
    );

    isBypassed = Boolean(isPublic || bypassTenantAccess);
    this.metadataCache.set(cacheKey, isBypassed);
    return isBypassed;
  }

  private resolveBlockReason(personal: Personal): BlockResult {
    if (personal.accessStatus === "expired") {
      return { code: "trial_expired", normalizedStatus: "expired" };
    }

    if (personal.accessStatus === "past_due") {
      return { code: "payment_required", normalizedStatus: "past_due" };
    }

    if (personal.accessStatus === "canceled") {
      return { code: "subscription_inactive", normalizedStatus: "canceled" };
    }

    if (!personal.subscriptionPlanId) {
      if (personal.trialEndsAt && personal.trialEndsAt.getTime() < Date.now()) {
        return { code: "trial_expired", normalizedStatus: "expired" };
      }

      return { code: null, normalizedStatus: "trialing" };
    }

    if (!personal.subscriptionStatus) {
      return { code: "subscription_inactive", normalizedStatus: "canceled" };
    }

    if (PAYMENT_REQUIRED_SUBSCRIPTION_STATUSES.has(personal.subscriptionStatus)) {
      return { code: "payment_required", normalizedStatus: "past_due" };
    }

    if (INACTIVE_SUBSCRIPTION_STATUSES.has(personal.subscriptionStatus)) {
      return { code: "subscription_inactive", normalizedStatus: "canceled" };
    }

    if (ACTIVE_SUBSCRIPTION_STATUSES.has(personal.subscriptionStatus)) {
      return { code: null, normalizedStatus: "active" };
    }

    return { code: "subscription_inactive", normalizedStatus: "canceled" };
  }
}
