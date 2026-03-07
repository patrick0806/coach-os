import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyReply } from "fastify";

import { Public } from "@shared/decorators";
import { validate } from "@shared/utils";
import { API_TAGS } from "@shared/constants";
import { env } from "@config/env";

import { LoginRequestSchema, LoginResponseDTO } from "./dtos";
import { LoginService } from "./login.service";

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "login" })
export class LoginController {
  constructor(private readonly loginService: LoginService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login (Personal, Student, Admin)" })
  @ApiOkResponse({ type: LoginResponseDTO })
  async handle(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<LoginResponseDTO> {
    console.log("Here we go")
    const dto = validate(LoginRequestSchema, body);
    const result = await this.loginService.execute(dto);

    const isProduction = env.NODE_ENV === "production";
    reply.header(
      "Set-Cookie",
      `refreshToken=${result.refreshToken}; HttpOnly; SameSite=Strict; ${isProduction ? "Secure; " : ""}Path=/; Max-Age=${REFRESH_TOKEN_MAX_AGE}`,
    );

    return {
      accessToken: result.accessToken,
      role: result.role,
      personalSlug: result.personalSlug,
    };
  }
}
