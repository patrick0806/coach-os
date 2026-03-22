import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import {
  WorkoutSessionsRepository,
  WorkoutSession,
  WorkoutSessionWithExecutions,
} from "@shared/repositories/workoutSessions.repository";
import { validate } from "@shared/utils/validation.util";

const startSessionSchema = z.object({
  studentId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
  startedAt: z.coerce.date().optional(),
});

@Injectable()
export class StartWorkoutSessionUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly workoutDaysRepository: WorkoutDaysRepository,
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
  ) {}

  async execute(body: unknown, tenantId: string): Promise<WorkoutSessionWithExecutions> {
    const data = validate(startSessionSchema, body);

    // Validate student belongs to tenant
    const student = await this.studentsRepository.findById(data.studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    // Validate workout day belongs to tenant (via join chain)
    const workoutDay = await this.workoutDaysRepository.findByIdWithTenant(data.workoutDayId);
    if (!workoutDay) {
      throw new NotFoundException("Workout day not found");
    }
    if (workoutDay.tenantId !== tenantId) {
      throw new NotFoundException("Workout day not found");
    }

    // Idempotent: return existing active session for the same workoutDayId
    const existingSession = await this.workoutSessionsRepository.findActiveByStudentAndWorkoutDay(
      data.studentId,
      data.workoutDayId,
      tenantId,
    );

    if (existingSession) {
      // Return session with its executions so frontend can resume
      const sessionWithExecutions = await this.workoutSessionsRepository.findByIdWithExecutions(
        existingSession.id,
        tenantId,
      );
      if (!sessionWithExecutions) {
        throw new NotFoundException("Session not found");
      }
      return sessionWithExecutions;
    }

    // CHK-016: Prevent concurrent sessions for a DIFFERENT workoutDay
    const hasActive = await this.workoutSessionsRepository.hasActiveSession(data.studentId, tenantId);
    if (hasActive) {
      throw new BadRequestException("Student already has an active workout session for a different workout");
    }

    const newSession = await this.workoutSessionsRepository.create({
      tenantId,
      studentId: data.studentId,
      workoutDayId: data.workoutDayId,
      startedAt: data.startedAt ?? new Date(),
    });

    // Return new session with empty executions array for consistent response shape
    return { ...newSession, exerciseExecutions: [] };
  }
}
