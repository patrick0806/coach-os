import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { MyBookingsService } from "./my-bookings.service";
import { PaginatedBookingsDTO } from "../shared/dtos/booking.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.BOOKINGS)
@Controller({ version: "1", path: "bookings" })
export class MyBookingsController {
  constructor(private readonly myBookingsService: MyBookingsService) {}

  @Get("me")
  @ApiOperation({ summary: "Get bookings for the authenticated student" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "size", required: false, example: 10 })
  @ApiOkResponse({ type: PaginatedBookingsDTO })
  handle(
    @Query("page") page = "1",
    @Query("size") size = "10",
    @CurrentUser() user: IAccessToken,
  ): Promise<PaginatedBookingsDTO> {
    return this.myBookingsService.execute(
      { page: Number(page), size: Number(size) },
      user,
    );
  }
}
