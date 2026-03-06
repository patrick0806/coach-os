import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { DeleteAvailabilityService } from "./delete-availability.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.AVAILABILITY)
@Controller({ version: "1", path: "" })
export class DeleteAvailabilityController {
  constructor(private readonly deleteAvailabilityService: DeleteAvailabilityService) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an availability slot" })
  @ApiNoContentResponse()
  handle(@Param("id") id: string, @CurrentUser() user: IAccessToken): Promise<void> {
    return this.deleteAvailabilityService.execute(id, user);
  }
}
