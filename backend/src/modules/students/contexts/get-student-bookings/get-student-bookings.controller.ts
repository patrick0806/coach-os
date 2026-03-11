import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { PaginatedBookingsDTO } from "@modules/bookings/shared/dtos/booking.dto";

import { GetStudentBookingsService } from "./get-student-bookings.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class GetStudentBookingsController {
  constructor(private readonly getStudentBookingsService: GetStudentBookingsService) {}

  @Get(":id/bookings")
  @ApiOperation({ summary: "List bookings for a specific student" })
  @ApiOkResponse({ type: PaginatedBookingsDTO })
  handle(
    @Param("id") studentId: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<PaginatedBookingsDTO> {
    return this.getStudentBookingsService.execute(studentId, user);
  }
}
