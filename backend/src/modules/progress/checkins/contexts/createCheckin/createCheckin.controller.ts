import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateCheckinRequestDTO } from "./dtos/request.dto";
import { CheckinResponseDTO } from "./dtos/response.dto";
import { CreateCheckinUseCase } from "./createCheckin.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/progress-checkins" })
export class CreateCheckinController {
  constructor(private readonly createCheckinUseCase: CreateCheckinUseCase) {}

  @ApiOperation({ summary: "Create a progress checkin for a student" })
  @ApiCreatedResponse({ type: CheckinResponseDTO })
  @ApiNotFoundResponse({ description: "Student not found" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Param("studentId") studentId: string,
    @Body() body: CreateCheckinRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createCheckinUseCase.execute(studentId, body, user.personalId!);
  }
}
