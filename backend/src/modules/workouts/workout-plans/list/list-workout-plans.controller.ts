import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { ListWorkoutPlansService } from "./list-workout-plans.service";
import { PaginatedWorkoutPlansDTO } from "../shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: "" })
export class ListWorkoutPlansController {
  constructor(private readonly listWorkoutPlansService: ListWorkoutPlansService) {}

  @Get()
  @ApiOperation({ summary: "List workout plans of the authenticated personal" })
  @ApiQuery({ name: "kind", required: false, enum: ["template", "student"] })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "size", required: false, example: 10 })
  @ApiOkResponse({ type: PaginatedWorkoutPlansDTO })
  handle(
    @CurrentUser() user: IAccessToken,
    @Query("kind") kind?: "template" | "student",
    @Query("page") page: number = 1,
    @Query("size") size: number = 10,
  ): Promise<PaginatedWorkoutPlansDTO> {
    return this.listWorkoutPlansService.execute(user, {
      kind,
      page: Number(page),
      size: Number(size),
    });
  }
}
