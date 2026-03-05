import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLES_KEY } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

@Injectable()
export class RolesGuard implements CanActivate {
  private metadataCache = new Map<string, ApplicationRoles[] | null>();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const classRef = context.getClass();

    const cacheKey = `${classRef.name}_${handler.name}`;

    let requiredRoles = this.metadataCache.get(cacheKey);

    if (requiredRoles === undefined) {
      requiredRoles = this.reflector.getAllAndOverride<ApplicationRoles[]>(
        ROLES_KEY,
        [handler, classRef]
      );
      this.metadataCache.set(cacheKey, requiredRoles ?? null);
    }

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
