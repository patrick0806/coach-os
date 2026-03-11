import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { CheckController } from "@modules/health/contexts/check/check.controller";
import { CheckService } from "@modules/health/contexts/check/check.service";

describe("Health E2E", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CheckController],
      providers: [
        {
          provide: CheckService,
          useValue: {
            execute: vi.fn().mockResolvedValue({
              status: "ok",
              info: { database: { status: "up" } },
              error: {},
              details: { database: { status: "up" } },
            }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should answer health check successfully", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      info: { database: { status: "up" } },
      error: {},
      details: { database: { status: "up" } },
    });
  });
});
