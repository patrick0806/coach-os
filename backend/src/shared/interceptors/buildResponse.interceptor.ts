import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { map, Observable } from "rxjs";

import { LogBuilderService } from "@shared/providers";
import { getRequestContext } from "@shared/utils";

@Injectable()
export class BuildResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const startTime = Date.now();

    (request as any).startTime = startTime;

    return next.handle().pipe(
      map((params) => {
        const duration = Date.now() - startTime;

        if (!request.url.includes("health")) {
          const ctx = getRequestContext(request);

          LogBuilderService.build({
            level: "info",
            message: params?.message || "Request completed successfully",
            method: request.method,
            path: request.url,
            statusCode: 200,
            correlationId: ctx.correlationId,
            userId: ctx.userId,
            tenantId: ctx.tenantId,
            duration,
            code: params?.code,
            details: params?.details,
          });
        }

        return params?.data || params;
      })
    );
  }
}
