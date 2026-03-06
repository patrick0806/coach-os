import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyReply } from "fastify";

import { Public } from "@shared/decorators";
import { API_TAGS } from "@shared/constants";

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "logout" })
export class LogoutController {
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Logout — clear refresh token cookie" })
  @ApiNoContentResponse({ description: "Logout realizado com sucesso" })
  handle(@Res({ passthrough: true }) reply: FastifyReply): void {
    reply.header(
      "Set-Cookie",
      "refreshToken=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
    );
  }
}
