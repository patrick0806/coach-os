import { Controller, Get, Header, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";

import { EnumOptionDTO } from "../../dtos/enumOption.dto";
import { ListAttendanceTypesUseCase } from "./listAttendanceTypes.useCase";

@ApiTags(API_TAGS.ENUMS)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT, ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1", path: "" })
export class ListAttendanceTypesController {
  constructor(private readonly listAttendanceTypesUseCase: ListAttendanceTypesUseCase) {}

  @ApiOperation({ summary: "List all attendance type enum options" })
  @ApiOkResponse({ type: [EnumOptionDTO] })
  @HttpCode(HttpStatus.OK)
  @Header("Cache-Control", "private, max-age=86400")
  @Get("attendance-types")
  handle(): EnumOptionDTO[] {
    return this.listAttendanceTypesUseCase.execute();
  }
}
