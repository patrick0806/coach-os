import { Injectable } from "@nestjs/common";
import { differenceInDays, format, parseISO, startOfDay } from "date-fns";

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

    const today = startOfDay(new Date());
    const last = startOfDay(parseISO(lastWorkoutDate));
    const diffDays = differenceInDays(today, last);

    if (diffDays === 0) return currentStreak;
    if (diffDays === 1) return currentStreak + 1;
    return 1;
  }

  private todayUTCString(): string {
    return format(new Date(), "yyyy-MM-dd");
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
