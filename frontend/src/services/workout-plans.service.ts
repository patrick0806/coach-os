import { api } from "@/lib/api";

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  exercisedbGifUrl: string | null;
  youtubeUrl: string | null;
  sets: number;
  repetitions: number;
  load: string | null;
  restTime: string | null;
  executionTime: string | null;
  order: number;
  notes: string | null;
}

export interface WorkoutPlan {
  id: string;
  personalId: string;
  name: string;
  description: string | null;
  planKind: "template" | "student";
  sourceTemplateId: string | null;
  studentNames: string[];
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

type WorkoutPlanApiResponse = Partial<WorkoutPlan> & {
  id: string;
  personalId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type WorkoutPlanDetailApiResponse = WorkoutPlanApiResponse & {
  exercises: WorkoutExercise[];
};

function normalizeWorkoutPlan(plan: WorkoutPlanApiResponse): WorkoutPlan {
  return {
    id: plan.id,
    personalId: plan.personalId,
    name: plan.name,
    description: plan.description,
    planKind: plan.planKind ?? "template",
    sourceTemplateId: plan.sourceTemplateId ?? null,
    studentNames: plan.studentNames ?? [],
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

function normalizeWorkoutPlanDetail(plan: WorkoutPlanDetailApiResponse): WorkoutPlanDetail {
  return {
    ...normalizeWorkoutPlan(plan),
    exercises: plan.exercises,
  };
}

export interface CreateWorkoutPlanPayload {
  name: string;
  description?: string;
  planKind?: "template" | "student";
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
  restTime?: string;
  executionTime?: string;
  order?: number;
  notes?: string;
}

export interface CreateStudentPlanPayload {
  name: string;
  description?: string;
  studentId: string;
}

export async function createStudentWorkoutPlan(
  payload: CreateStudentPlanPayload,
): Promise<WorkoutPlan> {
  const { data } = await api.post<WorkoutPlanApiResponse>("/workout-plans/student", payload);
  return normalizeWorkoutPlan(data);
}

export async function listWorkoutPlans(
  params: { page?: number; size?: number; kind?: "template" | "student" } = {},
): Promise<PaginatedWorkoutPlans> {
  const { data } = await api.get<{
    content: WorkoutPlanApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }>("/workout-plans", { params });

  return {
    ...data,
    content: data.content.map(normalizeWorkoutPlan),
  };
}

export async function getWorkoutPlan(id: string): Promise<WorkoutPlanDetail> {
  const { data } = await api.get<WorkoutPlanDetailApiResponse>(`/workout-plans/${id}`);
  return normalizeWorkoutPlanDetail(data);
}

export async function createWorkoutPlan(payload: CreateWorkoutPlanPayload): Promise<WorkoutPlan> {
  const { data } = await api.post<WorkoutPlanApiResponse>("/workout-plans", payload);
  return normalizeWorkoutPlan(data);
}

export async function applyWorkoutTemplate(
  planId: string,
  payload: { studentId?: string },
): Promise<WorkoutPlan> {
  const { data } = await api.post<WorkoutPlanApiResponse>(
    `/workout-plans/${planId}/apply`,
    payload,
  );
  return normalizeWorkoutPlan(data);
}

export async function updateWorkoutPlan(
  id: string,
  payload: UpdateWorkoutPlanPayload,
): Promise<WorkoutPlanDetail> {
  const { data } = await api.patch<WorkoutPlanDetailApiResponse>(`/workout-plans/${id}`, payload);
  return normalizeWorkoutPlanDetail(data);
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
  const { data } = await api.get<WorkoutPlanApiResponse[]>(`/students/${studentId}/workout-plans`);
  return data.map(normalizeWorkoutPlan);
}

export async function getMeWorkoutPlans(): Promise<WorkoutPlan[]> {
  const { data } = await api.get<WorkoutPlanApiResponse[]>("/students/me/workout-plans");
  return data.map(normalizeWorkoutPlan);
}

export async function getMeWorkoutPlan(planId: string): Promise<WorkoutPlanDetail> {
  const { data } = await api.get<WorkoutPlanDetailApiResponse>(
    `/students/me/workout-plans/${planId}`,
  );
  return normalizeWorkoutPlanDetail(data);
}
