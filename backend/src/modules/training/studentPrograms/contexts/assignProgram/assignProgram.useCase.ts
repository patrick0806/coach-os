import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { ProgramTemplatesRepository } from "@shared/repositories/programTemplates.repository";
import { StudentProgramsRepository, StudentProgram } from "@shared/repositories/studentPrograms.repository";
import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import { StudentExercisesRepository } from "@shared/repositories/studentExercises.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { validate } from "@shared/utils/validation.util";

const assignProgramSchema = z.object({
  programTemplateId: z.string().optional(),
  name: z.string().min(3).max(200),
});

@Injectable()
export class AssignProgramUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
    private readonly studentProgramsRepository: StudentProgramsRepository,
    private readonly workoutDaysRepository: WorkoutDaysRepository,
    private readonly studentExercisesRepository: StudentExercisesRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    studentId: string,
    body: unknown,
    tenantId: string,
  ): Promise<StudentProgram> {
    const data = validate(assignProgramSchema, body);

    // Validate student belongs to tenant
    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    // If a template is provided, validate it
    let template = null;
    if (data.programTemplateId) {
      template = await this.programTemplatesRepository.findByIdWithTree(
        data.programTemplateId,
        tenantId,
      );
      if (!template) {
        throw new NotFoundException("Program template not found");
      }
    }

    let newProgram: StudentProgram | undefined;

    await this.drizzle.db.transaction(async (_tx) => {
      // Create the student program
      newProgram = await this.studentProgramsRepository.create({
        tenantId,
        studentId,
        programTemplateId: data.programTemplateId,
        name: data.name,
      });

      // If a template was provided, snapshot its structure
      if (template) {
        for (const workout of template.workoutTemplates) {
          const newDay = await this.workoutDaysRepository.create({
            studentProgramId: newProgram!.id,
            name: workout.name,
            order: workout.order,
          });

          for (const exercise of workout.exerciseTemplates) {
            await this.studentExercisesRepository.create({
              workoutDayId: newDay.id,
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              repetitions: exercise.repetitions ?? undefined,
              restSeconds: exercise.restSeconds ?? undefined,
              duration: exercise.duration ?? undefined,
              order: exercise.order,
              notes: exercise.notes ?? undefined,
            });
          }
        }
      }
    });

    return newProgram!;
  }
}
