import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  TrainingSchedulesRepository,
  TrainingSchedule,
} from "@shared/repositories/trainingSchedules.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { StudentProgramsRepository } from "@shared/repositories/studentPrograms.repository";
import { validate } from "@shared/utils/validation.util";

const createScheduleSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    studentProgramId: z.string().min(1).optional(),
    location: z.string().max(300).optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
    path: ["startTime"],
  });

@Injectable()
export class CreateTrainingScheduleUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly studentProgramsRepository: StudentProgramsRepository,
  ) {}

  async execute(
    studentId: string,
    body: unknown,
    tenantId: string,
  ): Promise<TrainingSchedule> {
    const data = validate(createScheduleSchema, body);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    if (data.studentProgramId) {
      const program = await this.studentProgramsRepository.findById(
        data.studentProgramId,
        tenantId,
      );
      if (!program) {
        throw new NotFoundException("Student program not found");
      }
    }

    return this.trainingSchedulesRepository.create({
      tenantId,
      studentId,
      studentProgramId: data.studentProgramId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
    });
  }
}
