import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "@shared/decorators";
import { API_TAGS } from "@shared/constants";

import { SetupPasswordService } from "./setup-password.service";
import { SetupPasswordDTO } from "./dtos/request.dto";

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "setup-password" })
export class SetupPasswordController {
  constructor(private readonly setupPasswordService: SetupPasswordService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set password using an invite token" })
  @ApiOkResponse({ schema: { example: { message: "Senha definida com sucesso" } } })
  handle(@Body() dto: SetupPasswordDTO): Promise<{ message: string }> {
    return this.setupPasswordService.execute(dto);
  }
}
