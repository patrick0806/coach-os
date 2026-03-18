import { Controller, Get, Header, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";

import { EnumOptionDTO } from "../../dtos/enumOption.dto";
import { ListMuscleGroupsUseCase } from "./listMuscleGroups.useCase";

@ApiTags(API_TAGS.ENUMS)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT, ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1", path: "" })
export class ListMuscleGroupsController {
  constructor(private readonly listMuscleGroupsUseCase: ListMuscleGroupsUseCase) {}

  @ApiOperation({ summary: "List all muscle group enum options" })
  @ApiOkResponse({ type: [EnumOptionDTO] })
  @HttpCode(HttpStatus.OK)
  @Header("Cache-Control", "private, max-age=86400")
  @Get("muscle-groups")
  handle(): EnumOptionDTO[] {
    return this.listMuscleGroupsUseCase.execute();
  }
}
