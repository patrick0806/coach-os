import { Controller, Get, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { GetPersonalService } from "./get-personal.service";
import { AdminPersonalDetailDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "personals" })
export class GetPersonalController {
  constructor(private readonly getPersonalService: GetPersonalService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get personal detail (admin only)" })
  @ApiOkResponse({ type: AdminPersonalDetailDTO })
  @ApiNotFoundResponse()
  handle(@Param("id") id: string): Promise<AdminPersonalDetailDTO> {
    return this.getPersonalService.execute(id);
  }
}
