export type ProgramTemplateStatus = "active" | "archived"

export interface ExerciseInfo {
  id: string
  name: string
  muscleGroup: string
  mediaUrl: string | null
}

export interface ExerciseTemplateItem {
  id: string
  workoutTemplateId: string
  exerciseId: string
  sets: number
  repetitions: number | null
  restSeconds: number | null
  duration: string | null
  notes: string | null
  order: number
  createdAt: string
  updatedAt: string
  exercise: ExerciseInfo
}

export interface WorkoutTemplateItem {
  id: string
  programTemplateId: string
  name: string
  order: number
  createdAt: string
  updatedAt: string
  exerciseTemplates: ExerciseTemplateItem[]
}

export interface ProgramTemplateDetail {
  id: string
  tenantId: string
  name: string
  description: string | null
  status: ProgramTemplateStatus
  createdAt: string
  updatedAt: string
  workoutTemplates: WorkoutTemplateItem[]
}

export interface ProgramTemplateItem {
  id: string
  tenantId: string
  name: string
  description: string | null
  status: ProgramTemplateStatus
  createdAt: string
  updatedAt: string
}

export interface PaginatedProgramTemplates {
  content: ProgramTemplateItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListProgramTemplatesParams {
  page?: number
  size?: number
  search?: string
  status?: ProgramTemplateStatus
}

export interface CreateProgramTemplateRequest {
  name: string
  description?: string
}

export interface UpdateProgramTemplateRequest {
  name?: string
  description?: string | null
}

export interface AddWorkoutTemplateRequest {
  name: string
}

export interface UpdateWorkoutTemplateRequest {
  name?: string
}

export interface ReorderWorkoutTemplatesRequest {
  ids: string[]
}

export interface AddExerciseTemplateRequest {
  exerciseId: string
  sets: number
  repetitions?: number
  restSeconds?: number
  duration?: string
  notes?: string
}

export interface UpdateExerciseTemplateRequest {
  sets?: number
  repetitions?: number | null
  restSeconds?: number | null
  duration?: string | null
  notes?: string | null
}

export interface ReorderExerciseTemplatesRequest {
  ids: string[]
}
