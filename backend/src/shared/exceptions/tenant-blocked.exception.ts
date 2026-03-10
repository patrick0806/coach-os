import { ForbiddenException } from "@nestjs/common";

export type TenantBlockedCode =
  | "trial_expired"
  | "payment_required"
  | "subscription_inactive";

export class TenantBlockedException extends ForbiddenException {
  error: string;
  code: TenantBlockedCode;

  constructor(code: TenantBlockedCode, message: string) {
    super(message);
    this.error = "tenant_blocked";
    this.code = code;
  }
}
