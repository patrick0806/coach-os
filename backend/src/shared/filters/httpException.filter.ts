import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";

import { LogBuilderService } from "@shared/providers";
import { getRequestContext, getRequestDuration } from "@shared/utils";

import { ExceptionDTO } from "./dtos/exception.dto";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpException & { error?: string; message: string; code?: string },
    host: ArgumentsHost
  ) {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const response = context.getResponse<FastifyReply>();
    const statusCode =
      Number(exception.getStatus()) || HttpStatus.INTERNAL_SERVER_ERROR;
    const ctx = getRequestContext(request);
    const duration = getRequestDuration(request);

    const exceptionResponse = new ExceptionDTO(
      statusCode,
      exception.error ?? HttpStatus[statusCode],
      request.url,
      ctx.correlationId,
      exception.message
    );
    exceptionResponse.code = exception.code;

    LogBuilderService.build({
      level: statusCode === HttpStatus.INTERNAL_SERVER_ERROR ? "error" : "warn",
      message: exception.message,
      method: request.method,
      path: request.url,
      statusCode,
      code: exception.error,
      correlationId: ctx.correlationId,
      userId: ctx.userId,
      tenantId: ctx.tenantId,
      duration,
      details: exceptionResponse,
    });

    response.code(statusCode).send(exceptionResponse);
  }
}
