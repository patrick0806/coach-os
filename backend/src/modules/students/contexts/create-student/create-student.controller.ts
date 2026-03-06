import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CreateStudentService } from "./create-student.service";
import { CreateStudentDTO } from "./dtos/request.dto";
import { CreateStudentResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class CreateStudentController {
  constructor(private readonly createStudentService: CreateStudentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new student and send invite email" })
  @ApiCreatedResponse({ type: CreateStudentResponseDTO })
  handle(
    @Body() dto: CreateStudentDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<CreateStudentResponseDTO> {
    return this.createStudentService.execute(dto, user);
  }
}
