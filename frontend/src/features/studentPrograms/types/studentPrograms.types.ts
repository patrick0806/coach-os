export type StudentProgramStatus = "active" | "finished" | "cancelled"

export interface StudentExerciseItem {
  id: string
  workoutDayId: string
  exerciseId: string
  sets: number
  repetitions: number | null
  plannedWeight: string | null
  restSeconds: number | null
  duration: string | null
  order: number
  notes: string | null
  exercise: {
    name: string
    muscleGroup: string | null
    mediaUrl: string | null
    youtubeUrl: string | null
  }
}

export interface WorkoutDayItem {
  id: string
  studentProgramId: string
  name: string
  description: string | null
  order: number
  studentExercises: StudentExerciseItem[]
}

export interface StudentProgramItem {
  id: string
  tenantId: string
  studentId: string
  programTemplateId: string | null
  name: string
  status: StudentProgramStatus
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StudentProgramDetail extends StudentProgramItem {
  workoutDays: WorkoutDayItem[]
}

export interface PaginatedStudentPrograms {
  content: StudentProgramItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListStudentProgramsParams {
  page?: number
  size?: number
  status?: StudentProgramStatus
}

export interface AssignProgramRequest {
  programTemplateId?: string
  name: string
}

export interface UpdateStudentProgramStatusRequest {
  status: StudentProgramStatus
}

export interface UpdateWorkoutDayRequest {
  name?: string
  description?: string | null
  order?: number
}

export interface UpdateStudentExerciseRequest {
  sets?: number
  repetitions?: number | null
  plannedWeight?: string | null
  restSeconds?: number | null
  duration?: string | null
  notes?: string | null
}

export interface AddWorkoutDayRequest {
  name: string
  description?: string
}

export interface AddStudentExerciseRequest {
  exerciseId: string
  sets: number
  repetitions?: number
  plannedWeight?: string
  restSeconds?: number
  duration?: string
  notes?: string
}

export interface ReorderItemsRequest {
  items: { id: string; order: number }[]
}
