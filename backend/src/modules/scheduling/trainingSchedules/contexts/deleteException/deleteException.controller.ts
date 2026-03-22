import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteExceptionUseCase } from "./deleteException.useCase";

@ApiTags(API_TAGS.TRAINING_SCHEDULE)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "training-schedule-exceptions" })
export class DeleteExceptionController {
  constructor(private readonly deleteExceptionUseCase: DeleteExceptionUseCase) {}

  @ApiOperation({ summary: "Delete a training schedule exception" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Exception not found" })
  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteExceptionUseCase.execute(id, user.personalId!);
  }
}
