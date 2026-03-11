import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { IAccessToken } from "@shared/interfaces";

import { UpdateWorkoutPlanInput, UpdateWorkoutPlanSchema } from "./dtos/request.dto";
import { WorkoutPlanDetailDTO } from "../shared/dtos/workout-plan.dto";

@Injectable()
export class UpdateWorkoutPlanService {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
  ) { }

  async execute(
    id: string,
    dto: UpdateWorkoutPlanInput,
    currentUser: IAccessToken,
  ): Promise<WorkoutPlanDetailDTO> {
    const parsed = UpdateWorkoutPlanSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const tenantId = currentUser.personalId as string;
    const plan = await this.workoutPlansRepository.findById(id, tenantId);

    if (!plan) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    const updateData = parsed.data;

    // Evitar query de update vazia 
    if (Object.keys(updateData).length === 0) {
      return {
        ...plan,
        studentNames: plan.studentNames ?? [],
        exercises: plan.exercises,
      };
    }

    const updated = await this.workoutPlansRepository.update(id, tenantId, updateData);
    if (!updated) {
      throw new NotFoundException("Plano de treino não encontrado após atualização");
    }

    const updatedDetail = await this.workoutPlansRepository.findById(id, tenantId);
    if (!updatedDetail) {
      throw new NotFoundException("Plano de treino não encontrado após atualização");
    }

    return updatedDetail;
  }
}
