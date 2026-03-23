import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";

import { AssignProgramUseCase } from "../assignProgram.useCase";

const makeStudent = () => ({
  id: "student-id-1",
  tenantId: "tenant-id-1",
  userId: "user-id-1",
  status: "active",
  phoneNumber: null,
  goal: null,
  observations: null,
  physicalRestrictions: null,
  currentStreak: 0,
  lastWorkoutDate: null,
  totalWorkouts: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "John Doe",
  email: "john@example.com",
});

const makeExerciseTemplate = () => ({
  id: "exercise-template-id-1",
  workoutTemplateId: "workout-id-1",
  exerciseId: "exercise-id-1",
  sets: 3,
  repetitions: 10,
  restSeconds: 60,
  duration: null,
  order: 1,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  exercise: {
    id: "exercise-id-1",
    name: "Supino Reto",
    muscleGroup: "peitoral",
    mediaUrl: null,
    youtubeUrl: null,
  },
});

const makeWorkoutTemplate = () => ({
  id: "workout-id-1",
  programTemplateId: "template-id-1",
  name: "Treino A",
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  exerciseTemplates: [makeExerciseTemplate()],
});

const makeTemplateWithTree = () => ({
  id: "template-id-1",
  tenantId: "tenant-id-1",
  name: "Programa de Força",
  description: "Descrição",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  workoutTemplates: [makeWorkoutTemplate()],
});

const makeStudentProgram = () => ({
  id: "program-id-1",
  tenantId: "tenant-id-1",
  studentId: "student-id-1",
  programTemplateId: "template-id-1",
  name: "Programa de Força",
  status: "active",
  startedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeWorkoutDay = () => ({
  id: "day-id-1",
  studentProgramId: "program-id-1",
  name: "Treino A",
  description: null,
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeStudentsRepository = () => ({
  findById: vi.fn().mockResolvedValue(makeStudent()),
});

const makeProgramTemplatesRepository = () => ({
  findByIdWithTree: vi.fn().mockResolvedValue(makeTemplateWithTree()),
});

const makeStudentProgramsRepository = () => ({
  create: vi.fn().mockResolvedValue(makeStudentProgram()),
});

const makeWorkoutDaysRepository = () => ({
  create: vi.fn().mockResolvedValue(makeWorkoutDay()),
});

const makeStudentExercisesRepository = () => ({
  create: vi.fn().mockResolvedValue({
    id: "student-exercise-id-1",
    workoutDayId: "day-id-1",
    exerciseId: "exercise-id-1",
    sets: 3,
    repetitions: 10,
    plannedWeight: null,
    restSeconds: 60,
    duration: null,
    order: 1,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

const makeDrizzle = () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      await fn({});
    }),
  },
});

describe("AssignProgramUseCase", () => {
  let useCase: AssignProgramUseCase;
  let studentsRepository: ReturnType<typeof makeStudentsRepository>;
  let programTemplatesRepository: ReturnType<typeof makeProgramTemplatesRepository>;
  let studentProgramsRepository: ReturnType<typeof makeStudentProgramsRepository>;
  let workoutDaysRepository: ReturnType<typeof makeWorkoutDaysRepository>;
  let studentExercisesRepository: ReturnType<typeof makeStudentExercisesRepository>;
  let drizzle: ReturnType<typeof makeDrizzle>;

  const tenantId = "tenant-id-1";

  beforeEach(() => {
    studentsRepository = makeStudentsRepository();
    programTemplatesRepository = makeProgramTemplatesRepository();
    studentProgramsRepository = makeStudentProgramsRepository();
    workoutDaysRepository = makeWorkoutDaysRepository();
    studentExercisesRepository = makeStudentExercisesRepository();
    drizzle = makeDrizzle();

    useCase = new AssignProgramUseCase(
      studentsRepository as any,
      programTemplatesRepository as any,
      studentProgramsRepository as any,
      workoutDaysRepository as any,
      studentExercisesRepository as any,
      drizzle as any,
    );
  });

  it("should assign a program with template snapshot", async () => {
    const result = await useCase.execute(
      "student-id-1",
      { programTemplateId: "template-id-1", name: "Programa de Força" },
      tenantId,
    );

    expect(studentProgramsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: "student-id-1",
        tenantId,
        programTemplateId: "template-id-1",
        name: "Programa de Força",
      }),
      expect.anything(),
    );
    expect(workoutDaysRepository.create).toHaveBeenCalledTimes(1);
    expect(studentExercisesRepository.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("program-id-1");
  });

  it("should assign a program without template", async () => {
    const programWithoutTemplate = { ...makeStudentProgram(), programTemplateId: null };
    studentProgramsRepository.create.mockResolvedValue(programWithoutTemplate);

    const result = await useCase.execute(
      "student-id-1",
      { name: "Programa Personalizado" },
      tenantId,
    );

    expect(studentProgramsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: "student-id-1",
        tenantId,
        programTemplateId: undefined,
        name: "Programa Personalizado",
      }),
      expect.anything(),
    );
    expect(workoutDaysRepository.create).not.toHaveBeenCalled();
    expect(result.programTemplateId).toBeNull();
  });

  it("should throw NotFoundException when student not found", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("nonexistent-student", { name: "Programa" }, tenantId),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when template not found", async () => {
    programTemplatesRepository.findByIdWithTree.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        "student-id-1",
        { programTemplateId: "nonexistent-template", name: "Programa" },
        tenantId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when template belongs to different tenant", async () => {
    programTemplatesRepository.findByIdWithTree.mockResolvedValue(undefined);

    await expect(
      useCase.execute(
        "student-id-1",
        { programTemplateId: "template-id-1", name: "Programa" },
        "other-tenant-id",
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw NotFoundException when student belongs to different tenant", async () => {
    studentsRepository.findById.mockResolvedValue(undefined);

    await expect(
      useCase.execute("student-id-1", { name: "Programa" }, "other-tenant-id"),
    ).rejects.toThrow(NotFoundException);
  });
});
