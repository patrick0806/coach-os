import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import { StudentExercisesRepository, StudentExercise } from "@shared/repositories/studentExercises.repository";
import { ExercisesRepository } from "@shared/repositories/exercises.repository";
import { validate } from "@shared/utils/validation.util";

const addStudentExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1),
  repetitions: z.number().int().min(0).optional(),
  plannedWeight: z.string().optional(),
  restSeconds: z.number().int().min(0).optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

@Injectable()
export class AddStudentExerciseUseCase {
  constructor(
    private readonly workoutDaysRepository: WorkoutDaysRepository,
    private readonly studentExercisesRepository: StudentExercisesRepository,
    private readonly exercisesRepository: ExercisesRepository,
  ) {}

  async execute(
    workoutDayId: string,
    body: unknown,
    tenantId: string,
  ): Promise<StudentExercise> {
    const data = validate(addStudentExerciseSchema, body);

    // Verify workout day exists and belongs to tenant
    const workoutDay = await this.workoutDaysRepository.findByIdWithTenant(workoutDayId);

    if (!workoutDay) {
      throw new NotFoundException("Workout day not found");
    }

    if (workoutDay.tenantId !== tenantId) {
      throw new NotFoundException("Workout day not found");
    }

    // Verify exercise exists and is visible to coach (global or same tenant)
    const exercise = await this.exercisesRepository.findById(data.exerciseId);

    if (!exercise) {
      throw new NotFoundException("Exercise not found");
    }

    // Exercise must be global (null tenantId) or owned by same tenant
    if (exercise.tenantId !== null && exercise.tenantId !== tenantId) {
      throw new NotFoundException("Exercise not found");
    }

    const maxOrder = await this.studentExercisesRepository.findMaxOrderByWorkoutDayId(workoutDayId);
    const nextOrder = maxOrder + 1;

    return this.studentExercisesRepository.create({
      workoutDayId,
      exerciseId: data.exerciseId,
      sets: data.sets,
      repetitions: data.repetitions,
      plannedWeight: data.plannedWeight,
      restSeconds: data.restSeconds,
      duration: data.duration,
      order: nextOrder,
      notes: data.notes,
    });
  }
}
