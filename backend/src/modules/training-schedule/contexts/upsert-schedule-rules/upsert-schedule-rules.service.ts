import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { ScheduleRulesRepository } from "@shared/repositories/schedule-rules.repository";
import { ScheduleRule } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";

import { ScheduleEngineService } from "../schedule-engine/schedule-engine.service";
import { UpsertScheduleRulesInput } from "./dtos/request.dto";

@Injectable()
export class UpsertScheduleRulesService {
  constructor(
    private studentsRepository: StudentsRepository,
    private scheduleRulesRepository: ScheduleRulesRepository,
    private scheduleEngineService: ScheduleEngineService,
  ) {}

  async execute(
    dto: UpsertScheduleRulesInput,
    studentId: string,
    currentUser: IAccessToken,
  ): Promise<ScheduleRule[]> {
    const personalId = currentUser.personalId as string;

    // Validate student belongs to this personal (tenant isolation)
    const student = await this.studentsRepository.findById(studentId, personalId);
    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    // Business rules validation
    for (const day of dto.days) {
      if (day.sessionType === "rest" && day.workoutPlanId) {
        throw new BadRequestException(
          `Dia de descanso (dayOfWeek: ${day.dayOfWeek}) não pode ter um treino vinculado`,
        );
      }
      if (day.sessionType !== "rest" && !day.workoutPlanId) {
        throw new BadRequestException(
          `Dia de treino (dayOfWeek: ${day.dayOfWeek}) precisa de um treino vinculado`,
        );
      }
    }

    // Upsert each day rule and sync its future sessions
    const results: ScheduleRule[] = [];

    for (const day of dto.days) {
      const rule = await this.scheduleRulesRepository.upsert({
        personalId,
        studentId,
        dayOfWeek: day.dayOfWeek,
        workoutPlanId: day.workoutPlanId ?? null,
        scheduledTime: day.scheduledTime ?? null,
        sessionType: day.sessionType,
      });

      // Sync regenerates future pending sessions based on the updated rule
      await this.scheduleEngineService.syncRule(rule);

      results.push(rule);
    }

    return results;
  }
}
