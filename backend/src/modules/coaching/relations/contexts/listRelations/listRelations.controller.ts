import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CoachStudentRelationResponseDTO } from "./dtos/response.dto";
import { ListRelationsUseCase } from "./listRelations.useCase";

@ApiTags(API_TAGS.COACHING_RELATIONS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class ListRelationsController {
  constructor(private readonly listRelationsUseCase: ListRelationsUseCase) {}

  @ApiOperation({ summary: "List all coach-student relations" })
  @ApiOkResponse({ type: [CoachStudentRelationResponseDTO] })
  @Get()
  async handle(@CurrentUser() user: IAccessToken) {
    return this.listRelationsUseCase.execute(user.personalId!);
  }
}
