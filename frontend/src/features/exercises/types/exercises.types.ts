export interface ExerciseItem {
  id: string
  name: string
  muscleGroup: string
  description: string | null
  instructions: string | null
  mediaUrl: string | null
  youtubeUrl: string | null
  tenantId: string | null
  createdAt: string | null
}

export interface PaginatedExercises {
  content: ExerciseItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateExerciseRequest {
  name: string
  muscleGroup: string
  description?: string
  instructions?: string
  youtubeUrl?: string
}

export interface UpdateExerciseRequest {
  name?: string
  muscleGroup?: string
  description?: string | null
  instructions?: string | null
  mediaUrl?: string | null
  youtubeUrl?: string | null
}

export interface ListExercisesParams {
  page?: number
  size?: number
  search?: string
  muscleGroup?: string
}

export interface RequestUploadUrlRequest {
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "video/mp4"
}

export interface RequestUploadUrlResponse {
  uploadUrl: string
  fileUrl: string
}

export const MUSCLE_GROUPS = [
  { value: "peitoral", label: "Peitoral" },
  { value: "costas", label: "Costas" },
  { value: "ombros", label: "Ombros" },
  { value: "bíceps", label: "Bíceps" },
  { value: "tríceps", label: "Tríceps" },
  { value: "pernas", label: "Pernas" },
  { value: "glúteos", label: "Glúteos" },
  { value: "abdômen", label: "Abdômen" },
  { value: "panturrilha", label: "Panturrilha" },
  { value: "antebraço", label: "Antebraço" },
  { value: "trapézio", label: "Trapézio" },
  { value: "funcional", label: "Funcional" },
] as const
