import { api } from "@/lib/api";

export interface StudentStats {
  currentStreak: number;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
}

export async function getMyStats(): Promise<StudentStats> {
  const { data } = await api.get<StudentStats>("/students/me/stats");
  return data;
}

/** Returns true if the student risks losing their streak today (last workout was yesterday) */
export function isStreakAtRisk(stats: StudentStats): boolean {
  if (!stats.lastWorkoutDate || stats.currentStreak === 0) return false;

  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const [year, month, day] = stats.lastWorkoutDate.split("-").map(Number);
  const lastUTC = Date.UTC(year, month - 1, day);

  const diffDays = Math.round((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}
