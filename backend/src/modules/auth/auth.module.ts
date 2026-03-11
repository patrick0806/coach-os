import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { AdminsRepository } from "@shared/repositories/admins.repository";
import { PasswordSetupTokensRepository } from "@shared/repositories/password-setup-tokens.repository";
import { PasswordResetTokensRepository } from "@shared/repositories/password-reset-tokens.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { ResendProvider } from "@shared/providers/resend.provider";
import { env } from "@config/env";

import { JwtStrategy, LocalStrategy } from "./strategies";
import { AuthTokenService } from "./services/authToken.service";
import { RegisterController } from "./contexts/register/register.controller";
import { RegisterService } from "./contexts/register/register.service";
import { LoginController } from "./contexts/login/login.controller";
import { LoginService } from "./contexts/login/login.service";
import { RefreshController } from "./contexts/refresh/refresh.controller";
import { RefreshService } from "./contexts/refresh/refresh.service";
import { LogoutController } from "./contexts/logout/logout.controller";
import { SetupPasswordController } from "./contexts/setup-password/setup-password.controller";
import { SetupPasswordService } from "./contexts/setup-password/setup-password.service";
import { ForgotPasswordController } from "./contexts/forgot-password/forgot-password.controller";
import { ForgotPasswordService } from "./contexts/forgot-password/forgot-password.service";
import { ResetPasswordController } from "./contexts/reset-password/reset-password.controller";
import { ResetPasswordService } from "./contexts/reset-password/reset-password.service";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRATION as any },
    }),
  ],
  controllers: [
    RegisterController,
    LoginController,
    RefreshController,
    LogoutController,
    SetupPasswordController,
    ForgotPasswordController,
    ResetPasswordController,
  ],
  providers: [
    RegisterService,
    LoginService,
    RefreshService,
    SetupPasswordService,
    ForgotPasswordService,
    ResetPasswordService,
    AuthTokenService,
    JwtStrategy,
    LocalStrategy,
    UsersRepository,
    PersonalsRepository,
    StudentsRepository,
    AdminsRepository,
    PasswordSetupTokensRepository,
    PasswordResetTokensRepository,
    PlansRepository,
    ResendProvider,
  ],
  exports: [
    UsersRepository,
    PersonalsRepository,
    StudentsRepository,
    AdminsRepository,
    AuthTokenService,
  ],
})
export class AuthModule {}
