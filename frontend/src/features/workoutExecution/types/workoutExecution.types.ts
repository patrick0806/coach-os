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
  exerciseExecutions: ExerciseExecutionData[]
}

export interface ExerciseSetData {
  id: string
  exerciseExecutionId: string
  setNumber: number
  plannedReps: number | null
  performedReps: number | null
  plannedWeight: string | null
  usedWeight: string | null
  restSeconds: number | null
  completionStatus: "completed" | "partial" | "skipped"
}

export interface ExerciseExecutionData {
  id: string
  workoutSessionId: string
  studentExerciseId: string
  exerciseId: string
  order: number
  startedAt: string | null
  finishedAt: string | null
  exerciseSets: ExerciseSetData[]
}

export interface CreateExecutionRequest {
  workoutSessionId: string
  studentExerciseId: string
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
  plannedReps?: number
  performedReps: number
  plannedWeight?: number
  usedWeight?: number | null
  restSeconds?: number
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

export interface CompletedSetData {
  setNumber: number
  performedReps: number
  usedWeight: string
  status: "completed" | "skipped"
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
