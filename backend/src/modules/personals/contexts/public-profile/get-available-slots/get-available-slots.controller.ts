import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { Public } from "@shared/decorators";

import { GetAvailableSlotsService } from "./get-available-slots.service";
import { AvailableSlotsResponseDTO } from "./dtos/response.dto";

@Public()
@ApiTags("Public Profile")
@Controller({ version: "1", path: "personals/:slug/available-slots" })
export class GetAvailableSlotsController {
  constructor(private readonly service: GetAvailableSlotsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retorna os slots de disponibilidade livres e ocupados para uma data" })
  @ApiQuery({ name: "date", description: "Data no formato YYYY-MM-DD", example: "2026-03-16" })
  @ApiOkResponse({ type: AvailableSlotsResponseDTO })
  handle(
    @Param("slug") slug: string,
    @Query("date") date: string,
  ): Promise<AvailableSlotsResponseDTO> {
    return this.service.execute(slug, date);
  }
}
