import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";

import { ValidationException } from "@shared/exceptions";
import { LogBuilderService } from "@shared/providers";
import { getRequestContext, getRequestDuration } from "@shared/utils";

import { ExceptionDetail, ExceptionDTO } from "./dtos/exception.dto";

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const response = context.getResponse<FastifyReply>();
    const ctx = getRequestContext(request);
    const duration = getRequestDuration(request);

    const exceptionDeatils = new ExceptionDetail(
      "Invalid fields",
      exception.fields
    );
    const exceptionResponse = new ExceptionDTO(
      HttpStatus.BAD_REQUEST,
      "Bad Request",
      request.url,
      ctx.correlationId,
      "Invalid fields send in request",
      [exceptionDeatils]
    );

    LogBuilderService.build({
      level: "warn",
      message: exception.message,
      method: request.method,
      path: request.url,
      statusCode: HttpStatus.BAD_REQUEST,
      code: exception.error,
      correlationId: ctx.correlationId,
      userId: ctx.userId,
      tenantId: ctx.tenantId,
      duration,
      details: exceptionDeatils,
    });

    response.code(HttpStatus.BAD_REQUEST).send(exceptionResponse);
  }
}
