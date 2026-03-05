import helmet from "@fastify/helmet";
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
  HttpExceptionFilter,
  ValidationExceptionFilter,
} from "@shared/filters";
import { BuildResponseInterceptor } from "@shared/interceptors";

import { AppModule } from "./app.module";

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
      logger: false,
      bufferLogs: false,
    }
  );

  app.enableShutdownHooks();

  app.setGlobalPrefix(API_BASE_PATH);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  const swaggerConfig = new SwaggerConfig();
  swaggerConfig.setupSwagger(`${API_BASE_PATH}/docs`, app);

  app.useGlobalInterceptors(new BuildResponseInterceptor());
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter()
  );

  app.enableCors({
    origin: isDev ? "*" : "https://referer.com",
    //credentials: true,
    exposedHeaders: ["Access-Token", "Refresh-Token"],
  });

  await app.register(helmet, {
    contentSecurityPolicy: isDev ? false : undefined,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  logger.info(`🚀 Server running on http://localhost:${port}${API_BASE_PATH}`);
  logger.info(`📚 Swagger docs: http://localhost:${port}${API_BASE_PATH}/docs`);
}

bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
