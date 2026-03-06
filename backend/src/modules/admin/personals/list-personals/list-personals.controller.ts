import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { ListPersonalsService } from "./list-personals.service";
import { ListPersonalsQueryDTO } from "./dtos/request.dto";
import { PaginatedPersonalsDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "personals" })
export class ListPersonalsController {
  constructor(private readonly listPersonalsService: ListPersonalsService) {}

  @Get()
  @ApiOperation({ summary: "List all personals (paginated, admin only)" })
  @ApiOkResponse({ type: PaginatedPersonalsDTO })
  handle(@Query() query: ListPersonalsQueryDTO): Promise<PaginatedPersonalsDTO> {
    return this.listPersonalsService.execute({
      page: query.page ?? 1,
      size: query.size ?? 10,
      search: query.search,
    });
  }
}
