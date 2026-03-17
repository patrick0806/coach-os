import { Body, Controller, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateWorkoutDayRequestDTO } from "./dtos/request.dto";
import { UpdateWorkoutDayResponseDTO } from "./dtos/response.dto";
import { UpdateWorkoutDayUseCase } from "./updateWorkoutDay.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateWorkoutDayController {
  constructor(private readonly updateWorkoutDayUseCase: UpdateWorkoutDayUseCase) {}

  @ApiOperation({ summary: "Update a workout day" })
  @ApiOkResponse({ type: UpdateWorkoutDayResponseDTO })
  @HttpCode(HttpStatus.OK)
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateWorkoutDayRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateWorkoutDayUseCase.execute(id, body, user.personalId!);
  }
}
