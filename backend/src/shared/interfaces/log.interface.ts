export type LogLevel = "info" | "error" | "warn" | "debug";

export interface ILogParams {
  level: LogLevel;
  message: string;
  method: string;
  path: string;
  statusCode: number;
  code?: string;
  transactionId?: string | null;
  details?: any;
  error?: any;
  duration?: number;
  userId?: string | number;
}
export interface IStructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: {
    method: string;
    path: string;
    statusCode: number;
    transactionId?: string | null;
    duration?: number;
    userId?: string | number;
  };
  code?: string;
  details?: any;
  error?: any;
}
