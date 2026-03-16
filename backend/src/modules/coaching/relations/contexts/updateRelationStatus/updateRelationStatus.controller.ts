import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateRelationStatusRequestDTO } from "./dtos/request.dto";
import { UpdateRelationStatusUseCase } from "./updateRelationStatus.useCase";

@ApiTags(API_TAGS.COACHING_RELATIONS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateRelationStatusController {
  constructor(private readonly updateRelationStatusUseCase: UpdateRelationStatusUseCase) {}

  @ApiOperation({ summary: "Update coach-student relation status" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Patch(":id/status")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateRelationStatusRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateRelationStatusUseCase.execute(id, body, user.personalId!);
  }
}
