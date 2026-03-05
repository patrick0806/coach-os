import { pino } from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const pinoConfig = {
  level: isDev ? 'info' : 'error',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: false,
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: false,
  base: undefined, // Remove pid e hostname
};

export const logger = pino(pinoConfig);
