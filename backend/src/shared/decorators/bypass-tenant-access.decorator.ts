import { SetMetadata } from "@nestjs/common";

export const BYPASS_TENANT_ACCESS_KEY = "bypassTenantAccess";
export const BypassTenantAccess = () => SetMetadata(BYPASS_TENANT_ACCESS_KEY, true);
