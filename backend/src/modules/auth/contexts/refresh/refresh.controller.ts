import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyRequest } from "fastify";

import { Public } from "@shared/decorators";
import { API_TAGS } from "@shared/constants";

import { RefreshService } from "./refresh.service";
import { RefreshResponseDTO } from "./dtos/response.dto";

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "refresh" })
export class RefreshController {
  constructor(private readonly refreshService: RefreshService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiOkResponse({ type: RefreshResponseDTO })
  async handle(@Req() request: FastifyRequest): Promise<RefreshResponseDTO> {
    const cookieHeader = request.headers.cookie ?? "";
    const refreshToken = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("refreshToken="))
      ?.slice("refreshToken=".length);

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token não encontrado");
    }

    return this.refreshService.execute(refreshToken);
  }
}
