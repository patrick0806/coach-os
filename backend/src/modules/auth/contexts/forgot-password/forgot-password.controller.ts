import { Body, Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { Public } from "@shared/decorators";
import { API_TAGS } from "@shared/constants";
import { ForgotPasswordService } from "./forgot-password.service";
import { ForgotPasswordDTO } from "./dtos/request.dto";

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "forgot-password" })
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Solicita recuperação de senha" })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: "Retorna mensagem de sucesso (mesmo se e-mail não existir por segurança)" 
  })
  async handle(@Body() dto: ForgotPasswordDTO) {
    return this.forgotPasswordService.execute(dto);
  }
}
