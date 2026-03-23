import { pino } from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const pinoConfig = {
  level: 'info',
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: false,
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
      }
    : {}),
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: undefined, // Remove pid and hostname
};

export const logger = pino(pinoConfig);
