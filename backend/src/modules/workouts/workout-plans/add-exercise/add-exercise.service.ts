import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { WorkoutExercisesRepository, WorkoutExerciseRow } from "@shared/repositories/workout-exercises.repository";
import { IAccessToken } from "@shared/interfaces";

import { AddExerciseSchema, AddExerciseInput } from "./dtos/request.dto";

@Injectable()
export class AddExerciseService {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly workoutExercisesRepository: WorkoutExercisesRepository,
  ) {}

  async execute(
    planId: string,
    dto: AddExerciseInput,
    currentUser: IAccessToken,
  ): Promise<WorkoutExerciseRow> {
    const plan = await this.workoutPlansRepository.findById(
      planId,
      currentUser.personalId as string,
    );

    if (!plan) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    const parsed = AddExerciseSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    return this.workoutExercisesRepository.create({
      workoutPlanId: planId,
      exerciseId: parsed.data.exerciseId,
      sets: parsed.data.sets,
      repetitions: parsed.data.repetitions,
      load: parsed.data.load,
      restTime: parsed.data.restTime,
      executionTime: parsed.data.executionTime,
      order: parsed.data.order ?? 0,
      notes: parsed.data.notes,
    });
  }
}
