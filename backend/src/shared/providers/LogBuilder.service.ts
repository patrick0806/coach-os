import { logger } from '@config/pino.config';
import { ILogParams, IStructuredLog, LogLevel } from '@shared/interfaces/log.interface';
export class LogBuilderService {
  public static build(params: ILogParams): void {
    const structuredLog: IStructuredLog = {
      timestamp: new Date().toISOString(),
      level: params.level,
      message: params.message,
      context: {
        method: params.method,
        path: params.path,
        statusCode: params.statusCode,
        correlationId: params.correlationId,
        duration: params.duration,
        userId: params.userId,
        tenantId: params.tenantId,
      },
      code: params.code,
      details: params.details,
      error: params.error,
    };

    this.cleanUndefinedFields(structuredLog);
    this.cleanUndefinedFields(structuredLog.context);

    logger[params.level](structuredLog);
  }

  public static log(level: LogLevel, message: string, data?: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };

    this.cleanUndefinedFields(logData);
    logger[level](logData);
  }

  private static cleanUndefinedFields(obj: any): void {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    });
  }
}
