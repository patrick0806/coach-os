import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CheckoutService, CheckoutResult } from "./checkout.service";
import { CheckoutDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Controller({ version: "1", path: "checkout" })
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a Stripe Checkout session for a SaaS plan" })
  @ApiCreatedResponse({ schema: { example: { checkoutUrl: "https://checkout.stripe.com/..." } } })
  handle(
    @Body() dto: CheckoutDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<CheckoutResult> {
    return this.checkoutService.execute(dto.planId, user);
  }
}
