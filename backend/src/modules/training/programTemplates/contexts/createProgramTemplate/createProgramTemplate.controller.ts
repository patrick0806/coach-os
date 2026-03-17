import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateProgramTemplateRequestDTO } from "./dtos/request.dto";
import { CreateProgramTemplateResponseDTO } from "./dtos/response.dto";
import { CreateProgramTemplateUseCase } from "./createProgramTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class CreateProgramTemplateController {
  constructor(
    private readonly createProgramTemplateUseCase: CreateProgramTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Create a program template" })
  @ApiCreatedResponse({ type: CreateProgramTemplateResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateProgramTemplateRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createProgramTemplateUseCase.execute(body, user.personalId!);
  }
}
