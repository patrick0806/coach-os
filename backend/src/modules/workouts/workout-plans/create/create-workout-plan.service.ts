import { BadRequestException, Injectable } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { IAccessToken } from "@shared/interfaces";

import { CreateWorkoutPlanSchema, CreateWorkoutPlanInput } from "./dtos/request.dto";
import { WorkoutPlanDTO } from "../shared/dtos/workout-plan.dto";

@Injectable()
export class CreateWorkoutPlanService {
  constructor(private readonly workoutPlansRepository: WorkoutPlansRepository) {}

  async execute(dto: CreateWorkoutPlanInput, currentUser: IAccessToken): Promise<WorkoutPlanDTO> {
    const parsed = CreateWorkoutPlanSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    return this.workoutPlansRepository.create({
      personalId: currentUser.personalId as string,
      name: parsed.data.name,
      description: parsed.data.description,
    });
  }
}
