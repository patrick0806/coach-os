import { api } from "@/lib/api";

export interface ScheduleRule {
  id: string;
  personalId: string;
  studentId: string;
  dayOfWeek: number;
  workoutPlanId: string | null;
  startTime: string | null;
  endTime: string | null;
  sessionType: "presential" | "online" | "rest";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSession {
  id: string;
  personalId: string;
  studentId: string;
  scheduleRuleId: string;
  workoutPlanId: string | null;
  workoutSessionId: string | null;
  scheduledDate: string;
  startTime: string | null;
  endTime: string | null;
  status: "pending" | "completed" | "cancelled";
  sessionType: "presential" | "online" | "rest";
  cancelledAt: string | null;
  cancellationReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayRuleInput {
  dayOfWeek: number;
  sessionType: "presential" | "online" | "rest";
  workoutPlanId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface UpsertScheduleRulesPayload {
  days: DayRuleInput[];
}

export async function getScheduleRules(studentId: string): Promise<ScheduleRule[]> {
  const { data } = await api.get<ScheduleRule[]>(`/students/${studentId}/schedule-rules`);
  return data;
}

export async function upsertScheduleRules(
  studentId: string,
  payload: UpsertScheduleRulesPayload,
): Promise<ScheduleRule[]> {
  const { data } = await api.put<ScheduleRule[]>(
    `/students/${studentId}/schedule-rules`,
    payload,
  );
  return data;
}

export async function listTrainingSessions(
  studentId: string,
  query: { from: string; to: string },
): Promise<TrainingSession[]> {
  const { data } = await api.get<TrainingSession[]>(
    `/students/${studentId}/training-sessions`,
    { params: query },
  );
  return data;
}

export async function getTodaySession(): Promise<TrainingSession | null> {
  const { data } = await api.get<TrainingSession | null>("/training-sessions/today");
  return data;
}

export async function getWeekSessions(): Promise<TrainingSession[]> {
  const { data } = await api.get<TrainingSession[]>("/training-sessions/week");
  return data;
}

export async function completeTrainingSession(
  sessionId: string,
  workoutSessionId?: string,
): Promise<TrainingSession> {
  const { data } = await api.patch<TrainingSession>(
    `/training-sessions/${sessionId}/complete`,
    { workoutSessionId },
  );
  return data;
}

export async function cancelTrainingSession(
  sessionId: string,
  reason?: string,
  notifyStudent?: boolean,
): Promise<TrainingSession> {
  const { data } = await api.patch<TrainingSession>(
    `/training-sessions/${sessionId}/cancel`,
    { reason, notifyStudent },
  );
  return data;
}

export interface CalendarSession extends TrainingSession {
  studentName: string;
}

export async function getPersonalCalendar(query: { from: string; to: string }): Promise<CalendarSession[]> {
  const { data } = await api.get<CalendarSession[]>("/training-sessions/personal-calendar", {
    params: query,
  });
  return data;
}

export async function getActivityHistory(days = 84): Promise<TrainingSession[]> {
  const { data } = await api.get<TrainingSession[]>("/training-sessions/history", {
    params: { days },
  });
  return data;
}
