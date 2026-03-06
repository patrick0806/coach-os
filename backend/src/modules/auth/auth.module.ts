import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { AdminsRepository } from "@shared/repositories/admins.repository";
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
  ],
  providers: [
    RegisterService,
    LoginService,
    RefreshService,
    AuthTokenService,
    JwtStrategy,
    LocalStrategy,
    UsersRepository,
    PersonalsRepository,
    StudentsRepository,
    AdminsRepository,
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
