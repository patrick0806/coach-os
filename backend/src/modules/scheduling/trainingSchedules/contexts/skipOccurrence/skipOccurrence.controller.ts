import { Controller, Post, HttpCode, HttpStatus, Param, Body } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { SkipOccurrenceUseCase } from "./skipOccurrence.useCase";

@ApiTags(API_TAGS.TRAINING_SCHEDULE)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "training-schedules" })
export class SkipOccurrenceController {
  constructor(private readonly skipOccurrenceUseCase: SkipOccurrenceUseCase) {}

  @ApiOperation({ summary: "Skip a specific training occurrence" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Training schedule not found" })
  @HttpCode(HttpStatus.OK)
  @Post(":id/skip")
  async handle(
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.skipOccurrenceUseCase.execute(id, body, user.personalId!);
  }
}
