import { api } from "@/lib/axios"
import type {
  AddExerciseTemplateRequest,
  AddWorkoutTemplateRequest,
  CreateProgramTemplateRequest,
  ExerciseTemplateItem,
  ListProgramTemplatesParams,
  PaginatedProgramTemplates,
  ProgramTemplateDetail,
  ProgramTemplateItem,
  ReorderExerciseTemplatesRequest,
  ReorderWorkoutTemplatesRequest,
  UpdateExerciseTemplateRequest,
  UpdateProgramTemplateRequest,
  UpdateWorkoutTemplateRequest,
  WorkoutTemplateItem,
} from "@/features/trainingTemplates/types/trainingTemplates.types"

export const trainingTemplatesService = {
  list: async (params?: ListProgramTemplatesParams): Promise<PaginatedProgramTemplates> =>
    (await api.get<PaginatedProgramTemplates>("/program-templates", { params })).data,

  getById: async (id: string): Promise<ProgramTemplateDetail> =>
    (await api.get<ProgramTemplateDetail>(`/program-templates/${id}`)).data,

  create: async (data: CreateProgramTemplateRequest): Promise<ProgramTemplateItem> =>
    (await api.post<ProgramTemplateItem>("/program-templates", data)).data,

  update: async (id: string, data: UpdateProgramTemplateRequest): Promise<ProgramTemplateItem> =>
    (await api.put<ProgramTemplateItem>(`/program-templates/${id}`, data)).data,

  remove: async (id: string): Promise<void> => {
    await api.delete(`/program-templates/${id}`)
  },

  duplicate: async (id: string): Promise<ProgramTemplateItem> =>
    (await api.post<ProgramTemplateItem>(`/program-templates/${id}/duplicate`)).data,

  addWorkout: async (templateId: string, data: AddWorkoutTemplateRequest): Promise<WorkoutTemplateItem> =>
    (await api.post<WorkoutTemplateItem>(`/program-templates/${templateId}/workouts`, data)).data,

  reorderWorkouts: async (templateId: string, data: ReorderWorkoutTemplatesRequest): Promise<void> => {
    await api.patch(`/program-templates/${templateId}/workouts/reorder`, data)
  },

  updateWorkout: async (workoutId: string, data: UpdateWorkoutTemplateRequest): Promise<WorkoutTemplateItem> =>
    (await api.put<WorkoutTemplateItem>(`/workout-templates/${workoutId}`, data)).data,

  removeWorkout: async (workoutId: string): Promise<void> => {
    await api.delete(`/workout-templates/${workoutId}`)
  },

  addExercise: async (workoutId: string, data: AddExerciseTemplateRequest): Promise<ExerciseTemplateItem> =>
    (await api.post<ExerciseTemplateItem>(`/workout-templates/${workoutId}/exercises`, data)).data,

  reorderExercises: async (workoutId: string, data: ReorderExerciseTemplatesRequest): Promise<void> => {
    await api.patch(`/workout-templates/${workoutId}/exercises/reorder`, data)
  },

  updateExercise: async (exerciseTemplateId: string, data: UpdateExerciseTemplateRequest): Promise<ExerciseTemplateItem> =>
    (await api.put<ExerciseTemplateItem>(`/exercise-templates/${exerciseTemplateId}`, data)).data,

  removeExercise: async (exerciseTemplateId: string): Promise<void> => {
    await api.delete(`/exercise-templates/${exerciseTemplateId}`)
  },
}
