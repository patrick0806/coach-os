import { Injectable } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from "@nestjs/terminus";
import { DrizzleProvider } from "@shared/providers";

@Injectable()
export class CheckService {
  constructor(
    private healthCheckService: HealthCheckService,
    private healthIndicatorService: HealthIndicatorService,
    private drizzle: DrizzleProvider
  ) {}

  @HealthCheck()
  execute() {
    const indicator = this.healthIndicatorService.check("database");
    return this.healthCheckService.check([
      async () => {
        try {
          await this.drizzle.client.query("SELECT 1");
          return indicator.up();
        } catch (error) {
          return indicator.down({
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },
    ]);
  }
}
