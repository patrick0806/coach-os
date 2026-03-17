import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateProgressRecordRequestDTO } from "./dtos/request.dto";
import { CreateProgressRecordResponseDTO } from "./dtos/response.dto";
import { CreateProgressRecordUseCase } from "./createRecord.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/progress-records" })
export class CreateProgressRecordController {
  constructor(private readonly createProgressRecordUseCase: CreateProgressRecordUseCase) {}

  @ApiOperation({ summary: "Create a progress record for a student" })
  @ApiCreatedResponse({ type: CreateProgressRecordResponseDTO })
  @ApiNotFoundResponse({ description: "Student not found" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Param("studentId") studentId: string,
    @Body() body: CreateProgressRecordRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createProgressRecordUseCase.execute(studentId, body, user.personalId!);
  }
}
