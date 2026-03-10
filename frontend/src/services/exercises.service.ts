import { api } from "@/lib/api";
import { isYoutubeUrl } from "@/lib/youtube";

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

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  peito: "bg-blue-100 text-blue-700",
  costas: "bg-purple-100 text-purple-700",
  ombro: "bg-cyan-100 text-cyan-700",
  biceps: "bg-green-100 text-green-700",
  triceps: "bg-emerald-100 text-emerald-700",
  perna: "bg-orange-100 text-orange-700",
  gluteo: "bg-pink-100 text-pink-700",
  core: "bg-yellow-100 text-yellow-700",
};

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: MuscleGroup;
  exercisedbGifUrl: string | null;
  youtubeUrl: string | null;
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

export async function updateExerciseYoutubeUrl(
  id: string,
  youtubeUrl: string | null,
): Promise<{ youtubeUrl: string | null }> {
  const { data } = await api.patch<{ youtubeUrl: string | null }>(
    `/exercises/${id}/youtube-url`,
    { youtubeUrl },
  );
  return data;
}

export async function deleteExercise(id: string): Promise<void> {
  await api.delete(`/exercises/${id}`);
}

export { isYoutubeUrl };
