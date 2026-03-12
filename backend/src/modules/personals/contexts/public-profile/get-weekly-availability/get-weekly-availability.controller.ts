import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "@shared/decorators";

import { GetWeeklyAvailabilityService } from "./get-weekly-availability.service";
import { WeeklyAvailabilityResponseDTO } from "./dtos/response.dto";

@Public()
@ApiTags("Public Profile")
@Controller({ version: "1", path: "/:slug/weekly-availability" })
export class GetWeeklyAvailabilityController {
    constructor(private readonly service: GetWeeklyAvailabilityService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Retorna a grade padrão de disponibilidade semanal (0=Domingo a 6=Sábado)" })
    @ApiOkResponse({ type: WeeklyAvailabilityResponseDTO })
    handle(
        @Param("slug") slug: string,
    ): Promise<WeeklyAvailabilityResponseDTO> {
        return this.service.execute(slug);
    }
}
