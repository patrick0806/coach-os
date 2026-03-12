import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutSessionsRepository } from "@shared/repositories/workout-sessions.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { IAccessToken } from "@shared/interfaces";
import { WorkoutSession } from "@config/database/schema/workout";

import { StartSessionSchema, StartSessionInput } from "./dtos/request.dto";

@Injectable()
export class StartSessionService {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
  ) {}

  async execute(dto: StartSessionInput, currentUser: IAccessToken): Promise<WorkoutSession> {
    const parsed = StartSessionSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const studentId = currentUser.profileId;
    const { workoutPlanId } = parsed.data;

    const assignment = await this.workoutPlanStudentsRepository.findAssignment(
      workoutPlanId,
      studentId,
    );
    if (!assignment) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    const existing = await this.workoutSessionsRepository.findActiveByStudentAndPlan(
      studentId,
      workoutPlanId,
    );
    if (existing) {
      return existing;
    }

    return this.workoutSessionsRepository.create({ studentId, workoutPlanId });
  }
}
