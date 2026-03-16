import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import type { StringValue } from "ms";

import { env } from "@config/env";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { UsersRepository } from "@shared/repositories/users.repository";

import { RegisterController } from "./contexts/register/register.controller";
import { RegisterUseCase } from "./contexts/register/register.useCase";
import { LoginController } from "./contexts/login/login.controller";
import { LoginUseCase } from "./contexts/login/login.useCase";
import { RefreshTokenController } from "./contexts/refreshToken/refreshToken.controller";
import { RefreshTokenUseCase } from "./contexts/refreshToken/refreshToken.useCase";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRATION as StringValue },
    }),
  ],
  controllers: [
    RegisterController,
    LoginController,
    RefreshTokenController,
  ],
  providers: [
    JwtStrategy,
    StripeProvider,
    PersonalsRepository,
    UsersRepository,
    PlansRepository,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
  ],
  exports: [JwtModule, PersonalsRepository],
})
export class AuthModule {}
