import { Injectable } from "@nestjs/common";

import { StudentStatsRepository } from "@shared/repositories/student-stats.repository";

@Injectable()
export class StreakService {
  constructor(private readonly studentStatsRepository: StudentStatsRepository) {}

  /**
   * Pure function: calculates the new streak value based on the last workout date.
   * - Same day (diff = 0): maintain streak
   * - Yesterday (diff = 1): increment streak
   * - More than 1 day (diff > 1) or no previous date: reset to 1
   */
  calculateNewStreak(lastWorkoutDate: string | null, currentStreak: number): number {
    if (!lastWorkoutDate) return 1;

    // Use UTC to avoid timezone shifts between local and ISO string dates
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const [year, month, day] = lastWorkoutDate.split("-").map(Number);
    const lastUTC = Date.UTC(year, month - 1, day);

    const diffDays = Math.round((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return currentStreak;
    if (diffDays === 1) return currentStreak + 1;
    return 1;
  }

  private todayUTCString(): string {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  async updateStudentStats(studentId: string): Promise<void> {
    const stats = await this.studentStatsRepository.findById(studentId);
    if (!stats) return;

    const today = this.todayUTCString();
    const newStreak = this.calculateNewStreak(stats.lastWorkoutDate, stats.currentStreak);

    // Only increment totalWorkouts if this is the first workout of today
    const isNewWorkoutToday = stats.lastWorkoutDate !== today;
    const newTotalWorkouts = isNewWorkoutToday ? stats.totalWorkouts + 1 : stats.totalWorkouts;

    await this.studentStatsRepository.updateStats(studentId, {
      currentStreak: newStreak,
      lastWorkoutDate: today,
      totalWorkouts: newTotalWorkouts,
    });
  }
}
