import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { ResetPasswordRequestDTO } from "./dtos/request.dto";
import { ResetPasswordResponseDTO } from "./dtos/response.dto";
import { ResetPasswordUseCase } from "./resetPassword.useCase";

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "password-reset/confirm" })
export class ResetPasswordController {
  constructor(private readonly resetPasswordUseCase: ResetPasswordUseCase) {}

  @ApiOperation({ summary: "Reset password using a token received by email" })
  @ApiOkResponse({ type: ResetPasswordResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Post()
  async handle(@Body() body: ResetPasswordRequestDTO): Promise<ResetPasswordResponseDTO> {
    await this.resetPasswordUseCase.execute(body);

    return { message: "Password reset successfully" };
  }
}
