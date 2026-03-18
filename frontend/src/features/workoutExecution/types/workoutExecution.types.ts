export interface StartSessionRequest {
  studentId: string
  workoutDayId: string
}

export interface StartSessionResponse {
  id: string
  studentId: string
  workoutDayId: string
  status: string
  startedAt: string
  finishedAt: string | null
}

export interface CreateExecutionRequest {
  workoutSessionId: string
  exerciseId: string
}

export interface CreateExecutionResponse {
  id: string
  workoutSessionId: string
  exerciseId: string
  order: number
}

export interface RecordSetRequest {
  exerciseExecutionId: string
  setNumber: number
  plannedReps: number | null
  performedReps: number
  plannedWeight: string | null
  usedWeight: string | null
  restSeconds: number | null
  completionStatus: "completed" | "skipped" | "partial"
}

export interface RecordSetResponse {
  id: string
  exerciseExecutionId: string
  setNumber: number
  plannedReps: number | null
  performedReps: number
  plannedWeight: string | null
  usedWeight: string | null
  restSeconds: number | null
  completionStatus: string
}

export interface ExerciseSetItem {
  id: string
  setNumber: number
  plannedReps: number | null
  performedReps: number
  plannedWeight: string | null
  usedWeight: string | null
  restSeconds: number | null
  completionStatus: string
}

export interface ExerciseExecutionItem {
  id: string
  exerciseId: string
  order: number
  exercise: {
    name: string
    muscleGroup: string | null
  }
  sets: ExerciseSetItem[]
}

export interface WorkoutSession {
  id: string
  studentId: string
  workoutDayId: string
  status: string
  startedAt: string
  finishedAt: string | null
  executions: ExerciseExecutionItem[]
}
