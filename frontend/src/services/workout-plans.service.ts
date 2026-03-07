import { api } from "@/lib/api";

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  repetitions: number;
  load: string | null;
  order: number;
  notes: string | null;
}

export interface WorkoutPlan {
  id: string;
  personalId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanDetail extends WorkoutPlan {
  exercises: WorkoutExercise[];
}

export interface PaginatedWorkoutPlans {
  content: WorkoutPlan[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateWorkoutPlanPayload {
  name: string;
  description?: string;
}

export interface UpdateWorkoutPlanPayload {
  name?: string;
  description?: string;
}

export interface AddExercisePayload {
  exerciseId: string;
  sets: number;
  repetitions: number;
  load?: string;
  order?: number;
  notes?: string;
}

export async function listWorkoutPlans(
  params: { page?: number; size?: number } = {},
): Promise<PaginatedWorkoutPlans> {
  const { data } = await api.get<PaginatedWorkoutPlans>("/workout-plans", { params });
  return data;
}

export async function getWorkoutPlan(id: string): Promise<WorkoutPlanDetail> {
  const { data } = await api.get<WorkoutPlanDetail>(`/workout-plans/${id}`);
  return data;
}

export async function createWorkoutPlan(payload: CreateWorkoutPlanPayload): Promise<WorkoutPlan> {
  const { data } = await api.post<WorkoutPlan>("/workout-plans", payload);
  return data;
}

export async function updateWorkoutPlan(
  id: string,
  payload: UpdateWorkoutPlanPayload,
): Promise<WorkoutPlanDetail> {
  const { data } = await api.patch<WorkoutPlanDetail>(`/workout-plans/${id}`, payload);
  return data;
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  await api.delete(`/workout-plans/${id}`);
}

export async function addExerciseToPlan(
  planId: string,
  payload: AddExercisePayload,
): Promise<WorkoutPlanDetail> {
  const { data } = await api.post<WorkoutPlanDetail>(
    `/workout-plans/${planId}/exercises`,
    payload,
  );
  return data;
}

export async function removeExerciseFromPlan(
  planId: string,
  workoutExerciseId: string,
): Promise<void> {
  await api.delete(`/workout-plans/${planId}/exercises/${workoutExerciseId}`);
}

export async function reorderExercises(
  planId: string,
  items: { id: string; order: number }[],
): Promise<void> {
  await api.patch(`/workout-plans/${planId}/exercises/reorder`, { items });
}

export async function assignStudentsToPlan(
  planId: string,
  studentIds: string[],
): Promise<void> {
  await api.post(`/workout-plans/${planId}/students`, { studentIds });
}

export async function revokeStudentFromPlan(
  planId: string,
  studentId: string,
): Promise<void> {
  await api.delete(`/workout-plans/${planId}/students/${studentId}`);
}

export async function getStudentWorkoutPlans(studentId: string): Promise<WorkoutPlan[]> {
  const { data } = await api.get<WorkoutPlan[]>(`/students/${studentId}/workout-plans`);
  return data;
}
