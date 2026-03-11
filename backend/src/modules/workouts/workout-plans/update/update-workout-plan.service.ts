import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { WorkoutExercisesRepository } from "@shared/repositories/workout-exercises.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { IAccessToken } from "@shared/interfaces";

import { UpdateWorkoutPlanInput, UpdateWorkoutPlanSchema } from "./dtos/request.dto";
import { WorkoutPlanDetailDTO } from "../shared/dtos/workout-plan.dto";

@Injectable()
export class UpdateWorkoutPlanService {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly workoutExercisesRepository: WorkoutExercisesRepository,
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly drizzle: DrizzleProvider,
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

    // Se houver forkForStudentId, devemos clonar o template em vez de alterá-lo diretamente
    if (parsed.data.forkForStudentId) {
      if (plan.planKind !== "template") {
        throw new BadRequestException("Apenas modelos podem ser divididos (fork) para um aluno");
      }

      const studentId = parsed.data.forkForStudentId;
      const student = await this.studentsRepository.findById(studentId, tenantId);
      if (!student) {
        throw new BadRequestException("Aluno não encontrado ou não pertence a este personal");
      }

      return this.drizzle.db.transaction(async (tx) => {
        // 1. Criar o novo plano do tipo student
        const forkedPlan = await this.workoutPlansRepository.create(
          {
            personalId: tenantId,
            name: parsed.data.name ?? plan.name,
            description: parsed.data.description !== undefined ? parsed.data.description : plan.description,
            planKind: "student",
            sourceTemplateId: plan.id,
          },
          tx,
        );

        // 2. Copiar os exercícios
        const templateExercises = await this.workoutExercisesRepository.findByWorkoutPlanId(plan.id, tx);
        for (const exercise of templateExercises) {
          await this.workoutExercisesRepository.create(
            {
              workoutPlanId: forkedPlan.id,
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              repetitions: exercise.repetitions,
              load: exercise.load,
              order: exercise.order,
              notes: exercise.notes,
            },
            tx,
          );
        }

        // 3. Vincular o plano ao aluno
        await this.workoutPlanStudentsRepository.assign(forkedPlan.id, studentId, tx);

        // Opcional: remover o template antigo do aluno se ele estava vinculado a ele
        // Embora seja mais seguro deixar o frontend/usuário gerenciar isso ou simplesmente sobrescrever 
        // no sentido de uso, remover a vinculação do modelo genérico é recomendado
        await this.workoutPlanStudentsRepository.revoke(plan.id, studentId, tx);

        const forkedPlanDetail = await this.workoutPlansRepository.findById(forkedPlan.id, tenantId, tx);
        if (!forkedPlanDetail) {
          throw new NotFoundException("Plano de treino não encontrado após fork");
        }

        return forkedPlanDetail;
      });
    }

    // Atualização normal
    const { forkForStudentId, ...updateData } = parsed.data;

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
