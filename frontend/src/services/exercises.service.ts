import { api } from "@/lib/api";

export type MuscleGroup =
  | "peito"
  | "costas"
  | "ombro"
  | "biceps"
  | "triceps"
  | "perna"
  | "gluteo"
  | "core";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  peito: "Peito",
  costas: "Costas",
  ombro: "Ombro",
  biceps: "Bíceps",
  triceps: "Tríceps",
  perna: "Perna",
  gluteo: "Glúteo",
  core: "Core",
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "peito",
  "costas",
  "ombro",
  "biceps",
  "triceps",
  "perna",
  "gluteo",
  "core",
];

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: MuscleGroup;
  personalId: string | null;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListExercisesParams {
  search?: string;
  muscleGroup?: string;
}

export interface CreateExercisePayload {
  name: string;
  description?: string;
  muscleGroup: MuscleGroup;
}

export async function listExercises(params: ListExercisesParams = {}): Promise<Exercise[]> {
  const { data } = await api.get<Exercise[]>("/exercises", { params });
  return data;
}

export async function createExercise(payload: CreateExercisePayload): Promise<Exercise> {
  const { data } = await api.post<Exercise>("/exercises", payload);
  return data;
}

export async function deleteExercise(id: string): Promise<void> {
  await api.delete(`/exercises/${id}`);
}
