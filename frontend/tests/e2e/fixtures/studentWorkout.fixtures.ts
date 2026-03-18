// Static fixture data for student workout execution E2E behavioral tests.

export const MOCK_STUDENT_ID = "student-id-1"
export const MOCK_PROGRAM_ID = "prog-portal-1"
export const MOCK_WORKOUT_DAY_ID = "wd-portal-1"
export const MOCK_SESSION_ID = "session-1"
export const MOCK_EXECUTION_ID = "exec-1"

export const MOCK_STUDENT_USER = {
  id: MOCK_STUDENT_ID,
  name: "Maria Silva",
  email: "maria@student.com",
  role: "STUDENT",
  tenantId: "personal-tenant-id",
  personalSlug: "joao-silva",
}

const MOCK_EXERCISES = [
  {
    id: "se-portal-1",
    workoutDayId: MOCK_WORKOUT_DAY_ID,
    exerciseId: "ex-portal-1",
    sets: 3,
    repetitions: 10,
    plannedWeight: "50.00",
    restSeconds: 60,
    duration: null,
    order: 1,
    notes: null,
    exercise: { name: "Agachamento", muscleGroup: "Pernas", mediaUrl: null },
  },
  {
    id: "se-portal-2",
    workoutDayId: MOCK_WORKOUT_DAY_ID,
    exerciseId: "ex-portal-2",
    sets: 3,
    repetitions: 12,
    plannedWeight: "30.00",
    restSeconds: 45,
    duration: null,
    order: 2,
    notes: null,
    exercise: { name: "Leg Press", muscleGroup: "Pernas", mediaUrl: null },
  },
]

export const MOCK_WORKOUT_DAY = {
  id: MOCK_WORKOUT_DAY_ID,
  studentProgramId: MOCK_PROGRAM_ID,
  name: "Treino A — Pernas",
  description: "Foco em membros inferiores",
  order: 1,
  studentExercises: MOCK_EXERCISES,
}

export const programDetail = {
  id: MOCK_PROGRAM_ID,
  tenantId: "personal-tenant-id",
  studentId: MOCK_STUDENT_ID,
  programTemplateId: "tpl-1",
  name: "Programa de Hipertrofia",
  status: "active",
  startedAt: "2024-01-15T00:00:00Z",
  finishedAt: null,
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z",
  workoutDays: [MOCK_WORKOUT_DAY],
}

function paginated(content: object[], page = 0, size = 50) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

export const activePrograms = paginated([
  {
    id: MOCK_PROGRAM_ID,
    tenantId: "personal-tenant-id",
    studentId: MOCK_STUDENT_ID,
    programTemplateId: "tpl-1",
    name: "Programa de Hipertrofia",
    status: "active",
    startedAt: "2024-01-15T00:00:00Z",
    finishedAt: null,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
])

export const emptyPrograms = paginated([])

export const createdSession = {
  id: MOCK_SESSION_ID,
  studentId: MOCK_STUDENT_ID,
  workoutDayId: MOCK_WORKOUT_DAY_ID,
  status: "started",
  startedAt: new Date().toISOString(),
  finishedAt: null,
}

export const createdExecution = {
  id: MOCK_EXECUTION_ID,
  workoutSessionId: MOCK_SESSION_ID,
  exerciseId: "ex-portal-1",
  order: 1,
}

export const recordedSet = {
  id: "set-1",
  exerciseExecutionId: MOCK_EXECUTION_ID,
  setNumber: 1,
  plannedReps: 10,
  performedReps: 10,
  plannedWeight: "50.00",
  usedWeight: "50.00",
  restSeconds: 60,
  completionStatus: "completed",
}

export const MOCK_COACH_PUBLIC = {
  id: "personal-tenant-id",
  name: "João Silva",
  slug: "joao-silva",
  logoUrl: null,
  bio: "Personal trainer com 10 anos de experiência",
  specialties: ["Hipertrofia", "Emagrecimento"],
}
