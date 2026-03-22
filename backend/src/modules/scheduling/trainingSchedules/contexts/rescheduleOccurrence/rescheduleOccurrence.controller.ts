import { Controller, Post, HttpCode, HttpStatus, Param, Body } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { RescheduleOccurrenceUseCase } from "./rescheduleOccurrence.useCase";

@ApiTags(API_TAGS.TRAINING_SCHEDULE)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "training-schedules" })
export class RescheduleOccurrenceController {
  constructor(private readonly rescheduleOccurrenceUseCase: RescheduleOccurrenceUseCase) {}

  @ApiOperation({ summary: "Reschedule a specific training occurrence" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Training schedule not found" })
  @HttpCode(HttpStatus.OK)
  @Post(":id/reschedule")
  async handle(
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.rescheduleOccurrenceUseCase.execute(id, body, user.personalId!);
  }
}
