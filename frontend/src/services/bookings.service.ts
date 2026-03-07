import { api } from "@/lib/api";

export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
  "no-show": "Não compareceu",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  "no-show": "bg-orange-100 text-orange-700",
};

export interface Booking {
  id: string;
  studentId: string;
  personalId: string;
  servicePlanId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  cancellationReason: string | null;
  cancelledAt: string | null;
  notes: string | null;
  createdAt: string;
  studentName: string;
  studentEmail: string;
  servicePlanName: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

export interface CreateBookingPayload {
  servicePlanId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
}

export interface ListBookingsParams {
  status?: BookingStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface PaginatedBookings {
  content: Booking[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function getAvailableSlots(date: string): Promise<AvailableSlot[]> {
  const { data } = await api.get<AvailableSlot[]>("/bookings/available-slots", {
    params: { date },
  });
  return data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await api.post<Booking>("/bookings", payload);
  return data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[] | PaginatedBookings>("/bookings/me");

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.content)) {
    return data.content;
  }

  return [];
}

export async function listBookings(
  params: ListBookingsParams = {},
): Promise<PaginatedBookings> {
  const { data } = await api.get<PaginatedBookings>("/bookings", { params });
  return data;
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/bookings/${id}`);
  return data;
}

export async function updateBookingStatus(
  id: string,
  status: "completed" | "no-show",
): Promise<Booking> {
  const { data } = await api.patch<Booking>(`/bookings/${id}/status`, { status });
  return data;
}

export async function cancelBooking(id: string, reason: string): Promise<Booking> {
  const { data } = await api.patch<Booking>(`/bookings/${id}/cancel`, { reason });
  return data;
}
