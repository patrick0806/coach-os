import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { IAccessToken } from "@shared/interfaces";

import { UpdateWorkoutPlanInput } from "./dtos/request.dto";
import { WorkoutPlanDTO } from "../shared/dtos/workout-plan.dto";

@Injectable()
export class UpdateWorkoutPlanService {
  constructor(private readonly workoutPlansRepository: WorkoutPlansRepository) {}

  async execute(
    id: string,
    dto: UpdateWorkoutPlanInput,
    currentUser: IAccessToken,
  ): Promise<WorkoutPlanDTO> {
    const updated = await this.workoutPlansRepository.update(
      id,
      currentUser.personalId as string,
      dto,
    );

    if (!updated) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    return updated;
  }
}
