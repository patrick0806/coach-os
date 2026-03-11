import { Body, Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { Public } from "@shared/decorators";
import { API_TAGS } from "@shared/constants";
import { ResetPasswordService } from "./reset-password.service";
import { ResetPasswordDTO } from "./dtos/request.dto";

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "reset-password" })
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Redefine a senha usando um token válido" })
  @ApiResponse({ status: HttpStatus.OK, description: "Senha redefinida com sucesso" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Token inválido ou expirado" })
  async handle(@Body() dto: ResetPasswordDTO) {
    return this.resetPasswordService.execute(dto);
  }
}
