import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { SwaggerConfig } from "@config/swagger/swagger.config";

import { API_BASE_PATH } from "@shared/constants";
import { logger } from "@config/pino.config";
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
  ValidationExceptionFilter,
} from "@shared/filters";
import { BuildResponseInterceptor } from "@shared/interceptors";

import { AppModule } from "./app.module";
import { env } from "@config/env";

// Extend FastifyRequest to carry the raw body buffer for webhook signature validation
declare module "fastify" {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== "production";

  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    trustProxy: true,
    routerOptions: {
      caseSensitive: false,
      ignoreTrailingSlash: true,
    },
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      logger: ["error", "warn", "log"],
      bufferLogs: false,
    }
  );

  app.enableShutdownHooks();

  // Preserve raw body buffer on every request so the Stripe webhook handler
  // can validate the stripe-signature header against the original bytes.
  app.getHttpAdapter().getInstance().addHook(
    "preParsing",
    async (_req, _reply, payload) => {
      const chunks: Buffer[] = [];
      for await (const chunk of payload as AsyncIterable<Buffer>) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const rawBody = Buffer.concat(chunks);
      (_req as import("fastify").FastifyRequest).rawBody = rawBody;
      const { Readable } = await import("stream");
      return Readable.from(rawBody);
    },
  );

  app.setGlobalPrefix(API_BASE_PATH);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  const swaggerConfig = new SwaggerConfig();
  swaggerConfig.setupSwagger(`${API_BASE_PATH}/docs`, app);

  app.useGlobalInterceptors(new BuildResponseInterceptor());
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  );

  app.enableCors({
    origin: isDev
      ? ["http://localhost:3000", "http://localhost:3001"]
      : ["https://coachos.com.br", "http://www.coachos.com.br", "https://www.api.coachos.com.br", "https://api.coachos.com.br"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    exposedHeaders: ["Access-Token", "Refresh-Token"],
  });

  await app.register(helmet, {
    contentSecurityPolicy: isDev ? false : undefined,
  });

  await app.register(cookie);

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  logger.info(`🚀 Server running on http://localhost:${port}${API_BASE_PATH}`);
  logger.info(`📚 Swagger docs: http://localhost:${port}${API_BASE_PATH}/docs`);
}

bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
