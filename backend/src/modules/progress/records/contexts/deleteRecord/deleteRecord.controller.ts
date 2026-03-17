import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteProgressRecordUseCase } from "./deleteRecord.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "progress-records" })
export class DeleteProgressRecordController {
  constructor(private readonly deleteProgressRecordUseCase: DeleteProgressRecordUseCase) {}

  @ApiOperation({ summary: "Delete a progress record" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "Progress record not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteProgressRecordUseCase.execute(id, user.personalId!);
  }
}
