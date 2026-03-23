// Comprehensive fixtures for smoke, happy path, and critical tests.
// Reuses and extends existing fixtures from ../fixtures/.

export const MOCK_TENANT_ID = "mock-tenant-abc123"

// =============================================================================
// Plans
// =============================================================================

export const PLANS = [
  {
    id: "plan-basico",
    name: "Básico",
    price: "29.90",
    limitOfStudents: 10,
    hasTrial: true,
    highlighted: false,
    features: ["Gestão de alunos", "Criação de treinos", "Biblioteca de exercícios", "Portal do aluno"],
  },
  {
    id: "plan-pro",
    name: "Pro",
    price: "49.90",
    limitOfStudents: 30,
    hasTrial: false,
    highlighted: true,
    features: ["Tudo do Básico", "Exercícios personalizados", "Página pública", "Personalização de marca"],
  },
  {
    id: "plan-elite",
    name: "Elite",
    price: "99.90",
    limitOfStudents: 100,
    hasTrial: false,
    highlighted: false,
    features: ["Tudo do Pro", "Métricas avançadas", "Histórico completo", "Maior armazenamento"],
  },
]

// =============================================================================
// Admin
// =============================================================================

export const ADMIN_STATS = {
  totalCoaches: 42,
  payingCoaches: 30,
  newThisMonth: 5,
  totalStudents: 310,
  whitelistedCoaches: 3,
}

export const ADMIN_PLANS = [
  {
    id: "plan-1",
    name: "Básico",
    description: "Plano básico",
    price: "29.90",
    maxStudents: 10,
    highlighted: false,
    order: 1,
    benefits: [],
    stripePriceId: null,
    isDefault: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "plan-2",
    name: "Pro",
    description: "Plano pro",
    price: "49.90",
    maxStudents: 30,
    highlighted: true,
    order: 2,
    benefits: [],
    stripePriceId: null,
    isDefault: false,
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
]

// =============================================================================
// Dashboard
// =============================================================================

export const DASHBOARD_STATS = {
  activeStudents: 5,
  totalStudents: 8,
  programTemplates: 3,
  activeStudentPrograms: 4,
}

// =============================================================================
// Students
// =============================================================================

export const STUDENTS = [
  {
    id: "st-1",
    name: "Fernanda Costa",
    email: "fernanda@test.com",
    status: "active",
    phoneNumber: null,
    goal: null,
    observations: null,
    physicalRestrictions: null,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "st-2",
    name: "Carlos Mendonça",
    email: "carlos@test.com",
    status: "active",
    phoneNumber: null,
    goal: null,
    observations: null,
    physicalRestrictions: null,
    createdAt: "2024-01-11T00:00:00Z",
  },
]

function paginated(content: object[], page = 0, size = 20) {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
  }
}

export const studentsPaginated = paginated(STUDENTS)
export const studentsEmpty = paginated([])

// =============================================================================
// Exercises
// =============================================================================

export const GLOBAL_EXERCISES = [
  {
    id: "ex-global-1",
    name: "Supino Reto",
    muscleGroup: "peitoral",
    description: "Exercício de empurrar para peitoral",
    mediaUrl: null,
    tenantId: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

export const exercisesPaginated = paginated(GLOBAL_EXERCISES, 0, 9)

// =============================================================================
// Training Templates
// =============================================================================

export const TEMPLATES = [
  {
    id: "tpl-1",
    name: "Programa Hipertrofia",
    description: "Programa focado em ganho de massa muscular",
    status: "active",
    workoutCount: 3,
    createdAt: "2024-01-15T00:00:00Z",
  },
]

export const templatesPaginated = paginated(TEMPLATES, 0, 12)

// =============================================================================
// Profile
// =============================================================================

export const PROFILE_COMPLETE = {
  id: "profile-123",
  slug: "joao-silva",
  coachName: "João Silva",
  bio: "Personal trainer com 10 anos de experiência.",
  profilePhoto: null,
  logoUrl: null,
  phoneNumber: "(11) 98765-4321",
  specialties: ["Funcional", "Musculação"],
  themeColor: "#0066CC",
  themeColorSecondary: null,
  lpLayout: "1",
  lpTitle: "Transforme seu corpo",
  lpSubtitle: "Treino personalizado para seus objetivos",
  lpHeroImage: null,
  lpAboutTitle: "Sobre mim",
  lpAboutText: "Treinador dedicado a resultados reais.",
  lpImage1: null,
  lpImage2: null,
  lpImage3: null,
  lpDraftData: null,
}

export const PROFILE_WITH_DRAFT = {
  ...PROFILE_COMPLETE,
  lpDraftData: {
    lpLayout: "2",
    lpTitle: "Título do rascunho",
    lpSubtitle: "Subtítulo do rascunho",
  },
}

export const PROFILE_AFTER_PUBLISH = {
  ...PROFILE_COMPLETE,
  lpLayout: "2",
  lpTitle: "Título do rascunho",
  lpSubtitle: "Subtítulo do rascunho",
  lpDraftData: null,
}

// =============================================================================
// Scheduling
// =============================================================================

export const AVAILABILITY_RULES = [
  {
    id: "rule-1",
    tenantId: MOCK_TENANT_ID,
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "12:00",
    isActive: true,
  },
  {
    id: "rule-2",
    tenantId: MOCK_TENANT_ID,
    dayOfWeek: 3,
    startTime: "14:00",
    endTime: "18:00",
    isActive: true,
  },
]

export const CALENDAR_ENTRIES = [
  {
    type: "appointment",
    date: "2026-03-16",
    startTime: "09:00",
    endTime: "10:00",
    studentId: "st-1",
    studentName: "Fernanda Costa",
    appointmentType: "presential",
    status: "scheduled",
    location: "Academia Central",
    sourceId: "appt-1",
  },
  {
    type: "training_schedule",
    date: "2026-03-17",
    startTime: "10:00",
    endTime: "11:00",
    studentId: "st-2",
    studentName: "Carlos Mendonça",
    sourceId: "train-1",
  },
]

// =============================================================================
// Service Plans
// =============================================================================

export const SERVICE_PLANS = [
  {
    id: "sp-1",
    name: "Consultoria Online",
    attendanceType: "online",
    sessionsPerWeek: 3,
    price: "150.00",
    createdAt: "2024-01-01T00:00:00Z",
  },
]

// =============================================================================
// Student Portal / Workout Execution
// =============================================================================

export const MOCK_STUDENT_USER = {
  id: "student-id-1",
  name: "Maria Silva",
  email: "maria@student.com",
  role: "STUDENT",
  tenantId: "personal-tenant-id",
  personalSlug: "joao-silva",
}

export const STUDENT_PROGRAM = {
  id: "prog-1",
  tenantId: "personal-tenant-id",
  studentId: "student-id-1",
  programTemplateId: "tpl-1",
  name: "Programa de Hipertrofia",
  status: "active",
  startedAt: "2024-01-15T00:00:00Z",
  finishedAt: null,
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z",
  workoutDays: [
    {
      id: "wd-1",
      studentProgramId: "prog-1",
      name: "Treino A — Pernas",
      description: "Foco em membros inferiores",
      order: 1,
      studentExercises: [
        {
          id: "se-1",
          workoutDayId: "wd-1",
          exerciseId: "ex-1",
          sets: 3,
          repetitions: 10,
          plannedWeight: "50.00",
          restSeconds: 60,
          duration: null,
          order: 1,
          notes: null,
          exercise: { name: "Agachamento", muscleGroup: "Pernas", mediaUrl: null, youtubeUrl: null },
        },
      ],
    },
  ],
}

export const studentProgramsPaginated = paginated([
  {
    id: "prog-1",
    tenantId: "personal-tenant-id",
    studentId: "student-id-1",
    programTemplateId: "tpl-1",
    name: "Programa de Hipertrofia",
    status: "active",
    startedAt: "2024-01-15T00:00:00Z",
    finishedAt: null,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
], 0, 50)

export const CREATED_SESSION = {
  id: "session-1",
  studentId: "student-id-1",
  workoutDayId: "wd-1",
  status: "started",
  startedAt: new Date().toISOString(),
  finishedAt: null,
  exerciseExecutions: [],
}

export const CREATED_EXECUTION = {
  id: "exec-1",
  workoutSessionId: "session-1",
  exerciseId: "ex-1",
  order: 1,
}

export const RECORDED_SET = {
  id: "set-1",
  exerciseExecutionId: "exec-1",
  setNumber: 1,
  plannedReps: 10,
  performedReps: 10,
  plannedWeight: "50.00",
  usedWeight: "50.00",
  restSeconds: 60,
  completionStatus: "completed",
}

export const COACH_PUBLIC = {
  id: "personal-tenant-id",
  name: "João Silva",
  slug: "joao-silva",
  logoUrl: null,
  bio: "Personal trainer com 10 anos de experiência",
  specialties: ["Hipertrofia", "Emagrecimento"],
}
