import { Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyReply, FastifyRequest } from "fastify";

import { env } from "@config/env";
import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess, Public } from "@shared/decorators";

import { RefreshTokenResponseDTO } from "./dtos/response.dto";
import { RefreshTokenUseCase } from "./refreshToken.useCase";

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Public()
@BypassTenantAccess()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "refresh" })
export class RefreshTokenController {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {}

  @ApiOperation({ summary: "Rotate refresh token and get a new access token" })
  @ApiOkResponse({ type: RefreshTokenResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Post()
  async handle(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const cookieValue = (request as any).cookies?.refreshToken as string | undefined;
    const result = await this.refreshTokenUseCase.execute(cookieValue);

    reply.setCookie("refreshToken", cookieValue!.split(".")[0] + "." + result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth/refresh",
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
    });

    return { accessToken: result.accessToken };
  }
}
