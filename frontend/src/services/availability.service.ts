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

export interface BulkAvailabilityPayload {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  breakStart?: string;
  breakEnd?: string;
}

export interface BulkAvailabilityResponse {
  dayOfWeek: DayOfWeek;
  slotsCreated: number;
  slots: AvailabilitySlot[];
}

export interface CopyAvailabilityPayload {
  sourceDayOfWeek: DayOfWeek;
  targetDays: DayOfWeek[];
}

export interface CopyAvailabilityResponse {
  copiedToDays: DayOfWeek[];
  totalSlotsCreated: number;
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

export async function bulkAvailability(
  payload: BulkAvailabilityPayload,
): Promise<BulkAvailabilityResponse> {
  const { data } = await api.post<BulkAvailabilityResponse>("/availability/bulk", payload);
  return data;
}

export interface PublicAvailableSlots {
  freeSlots: { startTime: string; endTime: string }[];
  occupiedSlots: { startTime: string; endTime: string }[];
}

export async function getPublicAvailableSlots(
  slug: string,
  date: string,
): Promise<PublicAvailableSlots> {
  const { data } = await api.get<PublicAvailableSlots>(
    `/personals/${slug}/available-slots`,
    { params: { date } },
  );
  return data;
}

export async function copyAvailability(
  payload: CopyAvailabilityPayload,
): Promise<CopyAvailabilityResponse> {
  const { data } = await api.post<CopyAvailabilityResponse>("/availability/copy", payload);
  return data;
}
