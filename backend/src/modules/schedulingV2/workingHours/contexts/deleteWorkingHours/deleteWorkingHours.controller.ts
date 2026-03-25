import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteWorkingHoursUseCase } from "./deleteWorkingHours.useCase";

@ApiTags("Working Hours")
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "working-hours" })
export class DeleteWorkingHoursController {
  constructor(
    private readonly deleteWorkingHoursUseCase: DeleteWorkingHoursUseCase,
  ) {}

  @ApiOperation({ summary: "Delete working hours" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "Working hours not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteWorkingHoursUseCase.execute(id, user.personalId!);
  }
}
