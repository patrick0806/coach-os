import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { BulkAvailabilityService } from "./bulk-availability.service";
import { BulkAvailabilityDTO } from "./dtos/request.dto";
import { BulkAvailabilityResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.AVAILABILITY)
@Controller({ version: "1", path: "bulk" })
export class BulkAvailabilityController {
  constructor(private readonly bulkAvailabilityService: BulkAvailabilityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Replace availability slots of one weekday using batch configuration" })
  @ApiCreatedResponse({ type: BulkAvailabilityResponseDTO })
  handle(
    @Body() dto: BulkAvailabilityDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<BulkAvailabilityResponseDTO> {
    return this.bulkAvailabilityService.execute(dto, user);
  }
}
