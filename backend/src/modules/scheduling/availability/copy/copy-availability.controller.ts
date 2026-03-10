import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CopyAvailabilityService } from "./copy-availability.service";
import { CopyAvailabilityDTO } from "./dtos/request.dto";
import { CopyAvailabilityResponseDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.AVAILABILITY)
@Controller({ version: "1", path: "copy" })
export class CopyAvailabilityController {
  constructor(private readonly copyAvailabilityService: CopyAvailabilityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Copy availability slots from one weekday to multiple weekdays" })
  @ApiCreatedResponse({ type: CopyAvailabilityResponseDTO })
  handle(
    @Body() dto: CopyAvailabilityDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<CopyAvailabilityResponseDTO> {
    return this.copyAvailabilityService.execute(dto, user);
  }
}
