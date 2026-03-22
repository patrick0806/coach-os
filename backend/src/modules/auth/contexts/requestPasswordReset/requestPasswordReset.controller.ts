import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { RequestPasswordResetRequestDTO } from "./dtos/request.dto";
import { RequestPasswordResetResponseDTO } from "./dtos/response.dto";
import { RequestPasswordResetUseCase } from "./requestPasswordReset.useCase";

@Public()
@Throttle({ short: { ttl: 60_000, limit: 3 }, long: { ttl: 600_000, limit: 10 } })
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "password-reset/request" })
export class RequestPasswordResetController {
  constructor(private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase) {}

  @ApiOperation({ summary: "Request a password reset email" })
  @ApiOkResponse({ type: RequestPasswordResetResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Post()
  async handle(@Body() body: RequestPasswordResetRequestDTO): Promise<RequestPasswordResetResponseDTO> {
    await this.requestPasswordResetUseCase.execute(body);

    return { message: "If the email is registered, a reset link was sent" };
  }
}
