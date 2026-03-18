import { studentApi } from "@/lib/studentAxios"
import type {
  CreateExecutionRequest,
  CreateExecutionResponse,
  RecordSetRequest,
  RecordSetResponse,
  StartSessionRequest,
  StartSessionResponse,
  WorkoutSession,
} from "@/features/workoutExecution/types/workoutExecution.types"

export const workoutExecutionService = {
  startSession: async (data: StartSessionRequest): Promise<StartSessionResponse> =>
    (await studentApi.post<StartSessionResponse>("/workout-sessions", data)).data,

  pauseSession: async (id: string): Promise<void> => {
    await studentApi.patch(`/workout-sessions/${id}/pause`)
  },

  finishSession: async (id: string): Promise<void> => {
    await studentApi.patch(`/workout-sessions/${id}/finish`)
  },

  getSession: async (id: string): Promise<WorkoutSession> =>
    (await studentApi.get<WorkoutSession>(`/workout-sessions/${id}`)).data,

  createExecution: async (data: CreateExecutionRequest): Promise<CreateExecutionResponse> =>
    (await studentApi.post<CreateExecutionResponse>("/exercise-executions", data)).data,

  recordSet: async (data: RecordSetRequest): Promise<RecordSetResponse> =>
    (await studentApi.post<RecordSetResponse>("/exercise-sets", data)).data,
}
