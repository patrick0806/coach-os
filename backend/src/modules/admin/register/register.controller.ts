import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "@shared/decorators";
import { validate } from "@shared/utils";
import { API_TAGS } from "@shared/constants";

import { RegisterRequestSchema, RegisterResponseDTO } from "./dtos";
import { RegisterService } from "./register.service";

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller({ version: "1", path: "register" })
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register Personal Trainer" })
  @ApiCreatedResponse({ description: "Personal Trainer registered successfully", type: RegisterResponseDTO })
  async handle(@Body() body: unknown): Promise<RegisterResponseDTO> {
    const dto = validate(RegisterRequestSchema, body);
    return this.registerService.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
  }
}
