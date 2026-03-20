import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import type { StringValue } from "ms";

import { env } from "@config/env";
import { ResendProvider } from "@shared/providers/resend.provider";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { AdminsRepository } from "@shared/repositories/admins.repository";
import { PasswordTokensRepository } from "@shared/repositories/passwordTokens.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";

import { RegisterController } from "./contexts/register/register.controller";
import { RegisterUseCase } from "./contexts/register/register.useCase";
import { LoginController } from "./contexts/login/login.controller";
import { LoginUseCase } from "./contexts/login/login.useCase";
import { RefreshTokenController } from "./contexts/refreshToken/refreshToken.controller";
import { RefreshTokenUseCase } from "./contexts/refreshToken/refreshToken.useCase";
import { RequestPasswordResetController } from "./contexts/requestPasswordReset/requestPasswordReset.controller";
import { RequestPasswordResetUseCase } from "./contexts/requestPasswordReset/requestPasswordReset.useCase";
import { ResetPasswordController } from "./contexts/resetPassword/resetPassword.controller";
import { ResetPasswordUseCase } from "./contexts/resetPassword/resetPassword.useCase";
import { SetupPasswordController } from "./contexts/setupPassword/setupPassword.controller";
import { SetupPasswordUseCase } from "./contexts/setupPassword/setupPassword.useCase";
import { ChangePasswordController } from "./contexts/changePassword/changePassword.controller";
import { ChangePasswordUseCase } from "./contexts/changePassword/changePassword.useCase";
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
    RequestPasswordResetController,
    ResetPasswordController,
    SetupPasswordController,
    ChangePasswordController,
  ],
  providers: [
    JwtStrategy,
    StripeProvider,
    ResendProvider,
    AdminsRepository,
    PersonalsRepository,
    UsersRepository,
    PlansRepository,
    PasswordTokensRepository,
    StudentsRepository,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    SetupPasswordUseCase,
    ChangePasswordUseCase,
  ],
  exports: [JwtModule, PersonalsRepository],
})
export class AuthModule {}
