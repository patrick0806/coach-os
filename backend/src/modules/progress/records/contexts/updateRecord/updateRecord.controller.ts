import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateProgressRecordRequestDTO } from "./dtos/request.dto";
import { UpdateProgressRecordUseCase } from "./updateRecord.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "progress-records" })
export class UpdateProgressRecordController {
  constructor(private readonly updateProgressRecordUseCase: UpdateProgressRecordUseCase) {}

  @ApiOperation({ summary: "Update a progress record" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Progress record not found" })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateProgressRecordRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateProgressRecordUseCase.execute(id, body, user.personalId!);
  }
}
