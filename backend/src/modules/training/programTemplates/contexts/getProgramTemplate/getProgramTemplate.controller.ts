import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { GetProgramTemplateResponseDTO } from "./dtos/response.dto";
import { GetProgramTemplateUseCase } from "./getProgramTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class GetProgramTemplateController {
  constructor(
    private readonly getProgramTemplateUseCase: GetProgramTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Get program template with full tree" })
  @ApiOkResponse({ type: GetProgramTemplateResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.getProgramTemplateUseCase.execute(id, user.personalId!);
  }
}
