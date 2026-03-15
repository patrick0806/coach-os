import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";

import { HEADERS } from "@shared/constants";
import { LogBuilderService } from "@shared/providers";
import { getHeader, getRequestDuration } from "@shared/utils";

import { ExceptionDTO } from "./dtos/exception.dto";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const response = context.getResponse<FastifyReply>();
    const transactionId = getHeader(request.headers, HEADERS.TRANSACTION_ID);
    const duration = getRequestDuration(request);

    const message =
      exception instanceof Error ? exception.message : "Internal server error";

    const exceptionResponse = new ExceptionDTO(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      request.url,
      transactionId,
      message,
    );

    LogBuilderService.build({
      level: "error",
      message,
      method: request.method,
      path: request.url,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      transactionId,
      duration,
      error: exception instanceof Error ? exception : new Error(String(exception)),
    });

    response.code(HttpStatus.INTERNAL_SERVER_ERROR).send(exceptionResponse);
  }
}
