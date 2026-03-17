// Static fixture data for student programs E2E behavioral tests.

export const MOCK_STUDENT_ID = "st-1"
export const MOCK_PROGRAM_ID = "prog-1"

const MOCK_EXERCISE_1 = {
  name: "Agachamento",
  muscleGroup: "Pernas",
  mediaUrl: null,
}

const MOCK_EXERCISE_2 = {
  name: "Supino Reto",
  muscleGroup: "Peito",
  mediaUrl: null,
}

export const studentExercises = [
  {
    id: "se-1",
    workoutDayId: "wd-1",
    exerciseId: "ex-1",
    sets: 4,
    repetitions: 12,
    plannedWeight: "80.00",
    restSeconds: 60,
    duration: null,
    order: 1,
    notes: null,
    exercise: MOCK_EXERCISE_1,
  },
  {
    id: "se-2",
    workoutDayId: "wd-1",
    exerciseId: "ex-2",
    sets: 3,
    repetitions: 10,
    plannedWeight: "60.00",
    restSeconds: 90,
    duration: null,
    order: 2,
    notes: "Foco na técnica",
    exercise: MOCK_EXERCISE_2,
  },
]

export const workoutDays = [
  {
    id: "wd-1",
    studentProgramId: MOCK_PROGRAM_ID,
    name: "Treino A — Membros Inferiores",
    description: "Foco em pernas e glúteos",
    order: 1,
    studentExercises,
  },
  {
    id: "wd-2",
    studentProgramId: MOCK_PROGRAM_ID,
    name: "Treino B — Membros Superiores",
    description: null,
    order: 2,
    studentExercises: [],
  },
]

export const activeProgram = {
  id: MOCK_PROGRAM_ID,
  tenantId: "mock-tenant-abc123",
  studentId: MOCK_STUDENT_ID,
  programTemplateId: "tpl-1",
  name: "Programa de Hipertrofia",
  status: "active",
  startedAt: "2024-01-15T00:00:00Z",
  finishedAt: null,
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z",
}

export const finishedProgram = {
  id: "prog-2",
  tenantId: "mock-tenant-abc123",
  studentId: MOCK_STUDENT_ID,
  programTemplateId: null,
  name: "Programa Iniciante",
  status: "finished",
  startedAt: "2023-11-01T00:00:00Z",
  finishedAt: "2024-01-01T00:00:00Z",
  createdAt: "2023-11-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
}

export const programDetail = {
  ...activeProgram,
  workoutDays,
}

function paginated(content: object[], page = 0, size = 20) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

export const studentProgramsFixtures = {
  all: paginated([activeProgram, finishedProgram]),
  activeOnly: paginated([activeProgram]),
  finishedOnly: paginated([finishedProgram]),
  empty: paginated([]),
  afterAssign: (newProgram: object) => paginated([activeProgram, finishedProgram, newProgram]),
}

export const newProgramFixture = {
  id: "prog-new",
  tenantId: "mock-tenant-abc123",
  studentId: MOCK_STUDENT_ID,
  programTemplateId: null,
  name: "Novo Programa Funcional",
  status: "active",
  startedAt: null,
  finishedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockProgramTemplates = {
  content: [
    {
      id: "tpl-1",
      tenantId: "mock-tenant-abc123",
      name: "Programa de Hipertrofia",
      description: "Foco em ganho de massa muscular",
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
  page: 0,
  size: 100,
  totalElements: 1,
  totalPages: 1,
}
