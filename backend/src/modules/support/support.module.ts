import { Module } from "@nestjs/common";

import { ResendProvider } from "@shared/providers/resend.provider";

import { ContactSupportController } from "./contact/contact-support.controller";
import { ContactSupportService } from "./contact/contact-support.service";

@Module({
  controllers: [ContactSupportController],
  providers: [ContactSupportService, ResendProvider],
})
export class SupportModule {}
