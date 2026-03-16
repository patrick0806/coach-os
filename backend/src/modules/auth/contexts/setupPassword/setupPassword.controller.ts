import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { SetupPasswordRequestDTO } from "./dtos/request.dto";
import { SetupPasswordResponseDTO } from "./dtos/response.dto";
import { SetupPasswordUseCase } from "./setupPassword.useCase";

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "password-setup" })
export class SetupPasswordController {
  constructor(private readonly setupPasswordUseCase: SetupPasswordUseCase) {}

  @ApiOperation({ summary: "Set initial password for an invited user" })
  @ApiOkResponse({ type: SetupPasswordResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Post()
  async handle(@Body() body: SetupPasswordRequestDTO): Promise<SetupPasswordResponseDTO> {
    await this.setupPasswordUseCase.execute(body);

    return { message: "Password set successfully" };
  }
}
