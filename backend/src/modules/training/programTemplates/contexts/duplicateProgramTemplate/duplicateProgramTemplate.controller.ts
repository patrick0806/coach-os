import { Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DuplicateProgramTemplateResponseDTO } from "./dtos/response.dto";
import { DuplicateProgramTemplateUseCase } from "./duplicateProgramTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class DuplicateProgramTemplateController {
  constructor(
    private readonly duplicateProgramTemplateUseCase: DuplicateProgramTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Duplicate a program template" })
  @ApiCreatedResponse({ type: DuplicateProgramTemplateResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post(":id/duplicate")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.duplicateProgramTemplateUseCase.execute(id, user.personalId!);
  }
}
