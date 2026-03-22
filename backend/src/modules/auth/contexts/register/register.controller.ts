import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { FastifyReply } from "fastify";

import { env } from "@config/env";
import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { RegisterRequestDTO } from "./dtos/request.dto";
import { RegisterResponseDTO } from "./dtos/response.dto";
import { RegisterUseCase } from "./register.useCase";

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Public()
@Throttle({ short: { ttl: 60_000, limit: 3 }, long: { ttl: 600_000, limit: 10 } })
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "register" })
export class RegisterController {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  @ApiOperation({ summary: "Register a new coach account" })
  @ApiCreatedResponse({ type: RegisterResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: RegisterRequestDTO,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.registerUseCase.execute(body);

    reply.setCookie("refreshToken", `${result.user.id}.${result.refreshToken}`, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.COOKIE_DOMAIN ? "lax" : "strict",
      path: "/api/v1/auth/refresh",
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
      ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
      personal: result.personal,
      subscription: result.subscription,
    };
  }
}
