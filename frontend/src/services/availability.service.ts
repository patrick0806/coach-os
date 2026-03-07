import { api } from "@/lib/api";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

// Monday-first order
export const DAYS_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

export interface AvailabilitySlot {
  id: string;
  personalId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSlotPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpdateSlotPayload {
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export async function listAvailability(): Promise<AvailabilitySlot[]> {
  const { data } = await api.get<AvailabilitySlot[]>("/availability");
  return data;
}

export async function createSlot(payload: CreateSlotPayload): Promise<AvailabilitySlot> {
  const { data } = await api.post<AvailabilitySlot>("/availability", payload);
  return data;
}

export async function updateSlot(
  id: string,
  payload: UpdateSlotPayload,
): Promise<AvailabilitySlot> {
  const { data } = await api.patch<AvailabilitySlot>(`/availability/${id}`, payload);
  return data;
}

export async function deleteSlot(id: string): Promise<void> {
  await api.delete(`/availability/${id}`);
}
