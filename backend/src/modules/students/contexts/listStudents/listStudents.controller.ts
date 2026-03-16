import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListStudentsResponseDTO } from "./dtos/response.dto";
import { ListStudentsUseCase } from "./listStudents.useCase";

@ApiTags(API_TAGS.STUDENTS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class ListStudentsController {
  constructor(private readonly listStudentsUseCase: ListStudentsUseCase) {}

  @ApiOperation({ summary: "List students with pagination and filters" })
  @ApiOkResponse({ type: ListStudentsResponseDTO })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "size", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "status", required: false, enum: ["active", "paused", "archived"] })
  @Get()
  async handle(@Query() query: Record<string, string>, @CurrentUser() user: IAccessToken) {
    return this.listStudentsUseCase.execute(query, user.personalId!);
  }
}
