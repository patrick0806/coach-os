import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { IAccessToken } from "@shared/interfaces";

import { CreateStudentPlanInput, CreateStudentPlanSchema } from "./dtos/request.dto";
import { WorkoutPlanDTO } from "../shared/dtos/workout-plan.dto";

@Injectable()
export class CreateStudentPlanService {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(dto: CreateStudentPlanInput, currentUser: IAccessToken): Promise<WorkoutPlanDTO> {
    const parsed = CreateStudentPlanSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const tenantId = currentUser.personalId as string;

    const student = await this.studentsRepository.findById(parsed.data.studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Aluno não encontrado ou não pertence a este personal");
    }

    return this.drizzle.db.transaction(async (tx) => {
      const plan = await this.workoutPlansRepository.create(
        {
          personalId: tenantId,
          name: parsed.data.name,
          description: parsed.data.description,
          planKind: "student",
          sourceTemplateId: null,
        },
        tx,
      );

      await this.workoutPlanStudentsRepository.assign(plan.id, parsed.data.studentId, tx);

      return plan;
    });
  }
}
