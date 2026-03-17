import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListProgramTemplatesQueryDTO } from "./dtos/query.dto";
import { ListProgramTemplatesResponseDTO } from "./dtos/response.dto";
import { ListProgramTemplatesUseCase } from "./listProgramTemplates.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class ListProgramTemplatesController {
  constructor(
    private readonly listProgramTemplatesUseCase: ListProgramTemplatesUseCase,
  ) {}

  @ApiOperation({ summary: "List program templates" })
  @ApiOkResponse({ type: ListProgramTemplatesResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Query() query: ListProgramTemplatesQueryDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listProgramTemplatesUseCase.execute(query, user.personalId!);
  }
}
