import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { ListStudentsService } from "./list-students.service";
import { ListStudentsResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class ListStudentsController {
  constructor(private readonly listStudentsService: ListStudentsService) {}

  @Get()
  @ApiOperation({ summary: "List students of the authenticated personal trainer" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "size", required: false, example: 10 })
  @ApiQuery({ name: "search", required: false })
  @ApiOkResponse({ type: ListStudentsResponseDTO })
  handle(
    @CurrentUser() user: IAccessToken,
    @Query("page") page: number = 1,
    @Query("size") size: number = 10,
    @Query("search") search?: string,
  ): Promise<ListStudentsResponseDTO> {
    return this.listStudentsService.execute(user, {
      page: Number(page),
      size: Number(size),
      search,
    });
  }
}
