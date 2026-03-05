import { Global, Module } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";

@Global()
@Module({
  providers: [DrizzleProvider],
  exports: [DrizzleProvider],
})
export class DatabaseModule {}
