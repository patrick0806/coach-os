import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateProgramTemplateRequestDTO } from "./dtos/request.dto";
import { UpdateProgramTemplateResponseDTO } from "./dtos/response.dto";
import { UpdateProgramTemplateUseCase } from "./updateProgramTemplate.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateProgramTemplateController {
  constructor(
    private readonly updateProgramTemplateUseCase: UpdateProgramTemplateUseCase,
  ) {}

  @ApiOperation({ summary: "Update a program template" })
  @ApiOkResponse({ type: UpdateProgramTemplateResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateProgramTemplateRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateProgramTemplateUseCase.execute(id, body, user.personalId!);
  }
}
