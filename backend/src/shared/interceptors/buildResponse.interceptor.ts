import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { map, Observable } from "rxjs";

import { HEADERS } from "@shared/constants";
import { LogBuilderService } from "@shared/providers";
import { getHeader } from "@shared/utils";

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
          LogBuilderService.build({
            level: "info",
            message: params?.message || "Request completed successfully",
            method: request.method,
            path: request.url,
            statusCode: 200,
            transactionId: getHeader(request.headers, HEADERS.TRANSACTION_ID),
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
