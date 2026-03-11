import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlanDTO } from "@modules/workouts/workout-plans/shared/dtos/workout-plan.dto";
import { IAccessToken } from "@shared/interfaces";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";

import {
    CreateStudentWorkoutPlanInput,
    CreateStudentWorkoutPlanSchema,
} from "./dtos/request.dto";

@Injectable()
export class CreateStudentWorkoutPlanService {
    constructor(
        private readonly studentsRepository: StudentsRepository,
        private readonly workoutPlansRepository: WorkoutPlansRepository,
        private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
        private readonly drizzle: DrizzleProvider,
    ) { }

    async execute(
        studentId: string,
        input: CreateStudentWorkoutPlanInput,
        currentUser: IAccessToken,
    ): Promise<WorkoutPlanDTO> {
        const parsed = CreateStudentWorkoutPlanSchema.safeParse(input);
        if (!parsed.success) {
            throw new BadRequestException(parsed.error.issues[0].message);
        }

        const tenantId = currentUser.personalId as string;

        const student = await this.studentsRepository.findById(studentId, tenantId);
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

            await this.workoutPlanStudentsRepository.assign(plan.id, studentId, tx);

            return {
                ...plan,
                studentNames: [student.name],
            };
        });
    }
}
