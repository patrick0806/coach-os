import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { DeleteAvailabilityExceptionUseCase } from "./deleteException.useCase";

@ApiTags(API_TAGS.AVAILABILITY)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "availability-exceptions" })
export class DeleteAvailabilityExceptionController {
  constructor(
    private readonly deleteAvailabilityExceptionUseCase: DeleteAvailabilityExceptionUseCase,
  ) {}

  @ApiOperation({ summary: "Delete an availability exception" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "Availability exception not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteAvailabilityExceptionUseCase.execute(
      id,
      user.personalId!,
    );
  }
}
