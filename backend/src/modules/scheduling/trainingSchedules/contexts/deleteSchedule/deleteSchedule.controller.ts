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

import { DeleteTrainingScheduleUseCase } from "./deleteSchedule.useCase";

@ApiTags(API_TAGS.TRAINING_SCHEDULE)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "training-schedules" })
export class DeleteTrainingScheduleController {
  constructor(
    private readonly deleteTrainingScheduleUseCase: DeleteTrainingScheduleUseCase,
  ) {}

  @ApiOperation({ summary: "Delete a training schedule" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "Training schedule not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.deleteTrainingScheduleUseCase.execute(id, user.personalId!);
  }
}
