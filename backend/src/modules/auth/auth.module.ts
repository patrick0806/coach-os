import { Module } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";

import { RegisterController } from "./contexts/register/register.controller";
import { RegisterService } from "./contexts/register/register.service";

@Module({
  imports: [],
  controllers: [RegisterController],
  providers: [RegisterService, UsersRepository, PersonalsRepository],
  exports: [UsersRepository, PersonalsRepository],
})
export class AuthModule {}
