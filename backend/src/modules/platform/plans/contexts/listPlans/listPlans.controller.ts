import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { ListPlansResponseDTO } from "./dtos/response.dto";
import { ListPlansUseCase } from "./listPlans.useCase";

@Public()
@ApiTags(API_TAGS.PLANS)
@Controller({ version: "1" })
export class ListPlansController {
  constructor(private readonly listPlansUseCase: ListPlansUseCase) {}

  @ApiOperation({ summary: "List all available plans" })
  @ApiOkResponse({ type: [ListPlansResponseDTO] })
  @Get()
  async handle() {
    return this.listPlansUseCase.execute();
  }
}
