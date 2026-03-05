import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

import { IS_PUBLIC_KEY } from "@shared/decorators/public.decorator";

@Injectable()
export class JWTAuthGuard extends AuthGuard("jwt") {
  private metadataCache = new Map<string, boolean>();

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const classRef = context.getClass();

    const cacheKey = `${classRef.name}_${handler.name}`;

    let isPublic = this.metadataCache.get(cacheKey);

    if (isPublic === undefined) {
      isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        handler,
        classRef,
      ]);
      this.metadataCache.set(cacheKey, isPublic ?? false);
    }

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
