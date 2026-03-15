import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { CheckController } from "./contexts/check/check.controller";
import { CheckService } from "./contexts/check/check.service";
import { DrizzleProvider } from "@shared/providers";

@Module({
  imports: [TerminusModule],
  controllers: [CheckController],
  providers: [CheckService, DrizzleProvider],
})
export class HealthModule { }
