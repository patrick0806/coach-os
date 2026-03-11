import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { Public } from "@shared/decorators";

import { ContactSupportService } from "./contact-support.service";
import { ContactSupportDTO } from "./dtos/request.dto";
import { ContactSupportResponseDTO } from "./dtos/response.dto";

@Public()
@ApiTags(API_TAGS.SUPPORT)
@Controller({ version: "1", path: "" })
export class ContactSupportController {
  constructor(private readonly contactSupportService: ContactSupportService) {}

  @Post("contact")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Receive support and sales contact messages from the website" })
  @ApiOkResponse({ type: ContactSupportResponseDTO })
  handle(@Body() dto: ContactSupportDTO): Promise<ContactSupportResponseDTO> {
    return this.contactSupportService.execute(dto);
  }
}
