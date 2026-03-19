import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { BYPASS_TENANT_ACCESS_KEY } from "@shared/decorators/bypass-tenant-access.decorator";
import { IS_PUBLIC_KEY } from "@shared/decorators/public.decorator";
import { ApplicationRoles } from "@shared/enums";
import { TenantBlockedException } from "@shared/exceptions";
import { PersonalsRepository } from "@shared/repositories/personals.repository";

const ACTIVE_STRIPE_STATUSES = new Set(["active", "trialing"]);

@Injectable()
export class TenantAccessGuard implements CanActivate {
  private metadataCache = new Map<string, { isPublic: boolean; isBypassed: boolean }>();

  constructor(
    private readonly reflector: Reflector,
    private readonly personalsRepository: PersonalsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const classRef = context.getClass();
    const cacheKey = `${classRef.name}_${handler.name}`;

    let metadata = this.metadataCache.get(cacheKey);

    if (!metadata) {
      const isPublic = !!this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, classRef]);
      const isBypassed = !!this.reflector.getAllAndOverride<boolean>(BYPASS_TENANT_ACCESS_KEY, [handler, classRef]);
      metadata = { isPublic, isBypassed };
      this.metadataCache.set(cacheKey, metadata);
    }

    if (metadata.isPublic || metadata.isBypassed) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    const { role, personalId } = user;

    if (role === ApplicationRoles.ADMIN) {
      return true;
    }

    if (role !== ApplicationRoles.PERSONAL && role !== ApplicationRoles.STUDENT) {
      return true;
    }

    if (!personalId) {
      throw new TenantBlockedException("subscription_inactive", "Tenant access denied");
    }

    const personal = await this.personalsRepository.findById(personalId);

    if (!personal) {
      throw new TenantBlockedException("subscription_inactive", "Tenant not found");
    }

    // Whitelisted accounts bypass all subscription checks
    if (personal.isWhitelisted) {
      return true;
    }

    // If there is a Stripe subscription, prioritize its status over local accessStatus
    if (personal.subscriptionStatus) {
      if (personal.subscriptionStatus === "past_due") {
        throw new TenantBlockedException("payment_required", "Payment required to continue using the platform");
      }

      if (ACTIVE_STRIPE_STATUSES.has(personal.subscriptionStatus)) {
        // Synchronize accessStatus if diverged (fire-and-forget)
        if (personal.accessStatus !== "active") {
          this.personalsRepository.updateSubscription(personalId, { accessStatus: "active" });
        }
        return true;
      }

      // Unknown or inactive Stripe status
      throw new TenantBlockedException("subscription_inactive", "Subscription is not active");
    }

    // No Stripe subscription — check trial/local status
    if (personal.accessStatus === "trialing") {
      if (personal.trialEndsAt && personal.trialEndsAt < new Date()) {
        // Fire-and-forget update to sync expired status
        this.personalsRepository.updateSubscription(personalId, { accessStatus: "expired" });
        throw new TenantBlockedException("trial_expired", "Trial period has expired");
      }
      return true;
    }

    if (personal.accessStatus === "active") {
      return true;
    }

    if (personal.accessStatus === "past_due") {
      throw new TenantBlockedException("payment_required", "Payment required to continue using the platform");
    }

    throw new TenantBlockedException("subscription_inactive", "Subscription is not active");
  }
}
