import { Body, Controller, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { UpdateStudentRequestDTO } from "./dtos/request.dto";
import { UpdateStudentUseCase } from "./updateStudent.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class UpdateStudentController {
  constructor(private readonly updateStudentUseCase: UpdateStudentUseCase) {}

  @ApiOperation({ summary: "Update student information" })
  @ApiOkResponse()
  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateStudentRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.updateStudentUseCase.execute(id, body, user.personalId!);
  }
}
