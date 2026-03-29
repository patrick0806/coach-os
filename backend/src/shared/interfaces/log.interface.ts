export type LogLevel = "info" | "error" | "warn" | "debug";

export interface ILogParams {
  level: LogLevel;
  message: string;
  method: string;
  path: string;
  statusCode: number;
  code?: string;
  correlationId?: string | null;
  details?: any;
  error?: any;
  duration?: number;
  userId?: string;
  tenantId?: string;
}
export interface IStructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: {
    method: string;
    path: string;
    statusCode: number;
    correlationId?: string | null;
    duration?: number;
    userId?: string;
    tenantId?: string;
  };
  code?: string;
  details?: any;
  error?: any;
}
