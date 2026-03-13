import { differenceInCalendarDays } from "date-fns";
import { api } from "@/lib/api";
import { parseIsoDate } from "@/lib/date";

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
  const diff = differenceInCalendarDays(new Date(), parseIsoDate(stats.lastWorkoutDate));
  return diff === 1;
}
