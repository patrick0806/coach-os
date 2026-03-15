import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import type { StringValue } from "ms";

import { env } from "@config/env";
import { PersonalsRepository } from "@shared/repositories/personals.repository";

import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRATION as StringValue },
    }),
  ],
  providers: [JwtStrategy, PersonalsRepository],
  exports: [JwtModule, PersonalsRepository],
})
export class AuthModule {}
