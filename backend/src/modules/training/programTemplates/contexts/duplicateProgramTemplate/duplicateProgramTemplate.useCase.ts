import { Injectable, NotFoundException } from "@nestjs/common";

import {
  ProgramTemplatesRepository,
  ProgramTemplate,
} from "@shared/repositories/programTemplates.repository";
import { WorkoutTemplatesRepository } from "@shared/repositories/workoutTemplates.repository";
import { ExerciseTemplatesRepository } from "@shared/repositories/exerciseTemplates.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";

@Injectable()
export class DuplicateProgramTemplateUseCase {
  constructor(
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
    private readonly workoutTemplatesRepository: WorkoutTemplatesRepository,
    private readonly exerciseTemplatesRepository: ExerciseTemplatesRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(id: string, tenantId: string): Promise<ProgramTemplate> {
    const original = await this.programTemplatesRepository.findByIdWithTree(id, tenantId);

    if (!original) {
      throw new NotFoundException("Program template not found");
    }

    // Deep copy in a transaction
    let newTemplate: ProgramTemplate | undefined;

    await this.drizzle.db.transaction(async (_tx) => {
      // Create new program template with "(cópia)" suffix
      newTemplate = await this.programTemplatesRepository.create({
        tenantId,
        name: `${original.name} (cópia)`,
        description: original.description ?? undefined,
      });

      // Deep copy workouts and exercises
      for (const workout of original.workoutTemplates) {
        const newWorkout = await this.workoutTemplatesRepository.create({
          programTemplateId: newTemplate!.id,
          name: workout.name,
          order: workout.order,
        });

        for (const exercise of workout.exerciseTemplates) {
          await this.exerciseTemplatesRepository.create({
            workoutTemplateId: newWorkout.id,
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
    });

    return newTemplate!;
  }
}
