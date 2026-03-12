import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";

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
  ) { }

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
      if (day.sessionType === "presential") {
        if (!day.startTime) {
          throw new BadRequestException(
            `Sessão presencial (dayOfWeek: ${day.dayOfWeek}) precisa de horário de início (startTime)`,
          );
        }
        if (!day.endTime) {
          throw new BadRequestException(
            `Sessão presencial (dayOfWeek: ${day.dayOfWeek}) precisa de horário de término (endTime)`,
          );
        }

        // Validate that the presential slot fits within the personal's availability
        const isCovered = await this.scheduleEngineService.isPresentialCoveredByAvailability(
          personalId,
          day.dayOfWeek,
          day.startTime,
          day.endTime,
        );
        if (!isCovered) {
          throw new BadRequestException(
            `O horário ${day.startTime}–${day.endTime} (dayOfWeek: ${day.dayOfWeek}) está fora da disponibilidade do profissional`,
          );
        }

        const conflicts = await this.scheduleRulesRepository.findConflictingRules(
          personalId,
          studentId,
          day.dayOfWeek,
          day.startTime,
          day.endTime,
        );

        if (conflicts.length > 0) {
          throw new ConflictException(
            `Já existe um treino presencial agendado nesse horário (${conflicts[0].startTime} às ${conflicts[0].endTime}) para outro aluno`,
          );
        }
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
        startTime: day.startTime ?? null,
        endTime: day.endTime ?? null,
        sessionType: day.sessionType,
      });

      // Sync regenerates future pending sessions based on the updated rule
      await this.scheduleEngineService.syncRule(rule);

      results.push(rule);
    }

    return results;
  }
}
