import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { WorkoutExercisesRepository } from "@shared/repositories/workout-exercises.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { IAccessToken } from "@shared/interfaces";

import { ApplyTemplateInput, ApplyTemplateSchema } from "./dtos/request.dto";
import { WorkoutPlanDTO } from "../shared/dtos/workout-plan.dto";

@Injectable()
export class ApplyTemplateService {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly workoutExercisesRepository: WorkoutExercisesRepository,
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    templateId: string,
    dto: ApplyTemplateInput,
    currentUser: IAccessToken,
  ): Promise<WorkoutPlanDTO> {
    const parsed = ApplyTemplateSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const tenantId = currentUser.personalId as string;
    const template = await this.workoutPlansRepository.findById(templateId, tenantId);

    if (!template) {
      throw new NotFoundException("Modelo de treino não encontrado");
    }

    if (template.planKind !== "template") {
      throw new BadRequestException("Somente modelos podem ser aplicados");
    }

    if (parsed.data.studentId) {
      const student = await this.studentsRepository.findById(parsed.data.studentId, tenantId);
      if (!student) {
        throw new BadRequestException(
          "Aluno não encontrado ou não pertence a este personal",
        );
      }
    }

    return this.drizzle.db.transaction(async (tx) => {
      const copiedPlan = await this.workoutPlansRepository.create(
        {
          personalId: tenantId,
          name: `Copia de ${template.name}`,
          description: template.description,
          planKind: "student",
          sourceTemplateId: template.id,
        },
        tx,
      );

      const templateExercises = await this.workoutExercisesRepository.findByWorkoutPlanId(
        templateId,
        tx,
      );

      for (const exercise of templateExercises) {
        await this.workoutExercisesRepository.create(
          {
            workoutPlanId: copiedPlan.id,
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            repetitions: exercise.repetitions,
            load: exercise.load,
            restTime: exercise.restTime,
            executionTime: exercise.executionTime,
            order: exercise.order,
            notes: exercise.notes,
          },
          tx,
        );
      }

      if (parsed.data.studentId) {
        await this.workoutPlanStudentsRepository.assign(
          copiedPlan.id,
          parsed.data.studentId,
          tx,
        );
      }

      return {
        ...copiedPlan,
        studentNames: [],
      };
    });
  }
}
