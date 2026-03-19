import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyReply } from "fastify";

import { env } from "@config/env";
import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { LoginRequestDTO } from "./dtos/request.dto";
import { LoginResponseDTO } from "./dtos/response.dto";
import { LoginUseCase } from "./login.useCase";

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "login" })
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @ApiOperation({ summary: "Authenticate a coach and receive tokens" })
  @ApiOkResponse({ type: LoginResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Post()
  async handle(
    @Body() body: LoginRequestDTO,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.loginUseCase.execute(body);

    reply.setCookie("refreshToken", `${result.user.id}.${result.refreshToken}`, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth/refresh",
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
      personal: result.personal,
      subscription: result.subscription,
    };
  }
}
