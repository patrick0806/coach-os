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
  seriesId?: string | null;
  isRecurring?: boolean;
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

export interface CreatePersonalBookingPayload {
  studentId: string;
  servicePlanId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface CreateBookingSeriesPayload {
  studentId: string;
  servicePlanId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  seriesStartDate: string;
  seriesEndDate: string;
  notes?: string;
}

export interface BookingSeries {
  id: string;
  studentId: string;
  servicePlanId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  seriesStartDate: string;
  seriesEndDate: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateBookingSeriesResponse {
  series: BookingSeries;
  bookingsCreated: number;
  bookings: Booking[];
}

export type DeleteBookingScope = "single" | "future" | "all";

export interface DeleteBookingResponse {
  scope: DeleteBookingScope;
  cancelledBookings: number;
  seriesCancelled: boolean;
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

function normalizeDateOnly(value: string): string {
  if (!value) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const [datePart] = value.split("T");
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : value;
}

function normalizeBooking(booking: Booking): Booking {
  return {
    ...booking,
    scheduledDate: normalizeDateOnly(booking.scheduledDate),
  };
}

export async function getAvailableSlots(date: string): Promise<AvailableSlot[]> {
  const { data } = await api.get<AvailableSlot[]>("/bookings/available-slots", {
    params: { date },
  });
  return data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await api.post<Booking>("/bookings", payload);
  return normalizeBooking(data);
}

export async function createPersonalBooking(
  payload: CreatePersonalBookingPayload,
): Promise<Booking> {
  const { data } = await api.post<Booking>("/bookings/personal", payload);
  return normalizeBooking(data);
}

export async function createBookingSeries(
  payload: CreateBookingSeriesPayload,
): Promise<CreateBookingSeriesResponse> {
  const { data } = await api.post<CreateBookingSeriesResponse>("/booking-series", payload);
  return {
    ...data,
    bookings: data.bookings.map(normalizeBooking),
  };
}

export async function listBookingSeries(): Promise<BookingSeries[]> {
  const { data } = await api.get<BookingSeries[]>("/booking-series");
  return data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[] | PaginatedBookings>("/bookings/me");

  if (Array.isArray(data)) {
    return data.map(normalizeBooking);
  }

  if (data && Array.isArray(data.content)) {
    return data.content.map(normalizeBooking);
  }

  return [];
}

export async function listBookings(
  params: ListBookingsParams = {},
): Promise<PaginatedBookings> {
  const { data } = await api.get<PaginatedBookings>("/bookings", { params });
  return {
    ...data,
    content: data.content.map(normalizeBooking),
  };
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/bookings/${id}`);
  return normalizeBooking(data);
}

export async function updateBookingStatus(
  id: string,
  status: "completed" | "no-show",
): Promise<Booking> {
  const { data } = await api.patch<Booking>(`/bookings/${id}/status`, { status });
  return normalizeBooking(data);
}

export async function cancelBooking(id: string, reason: string): Promise<Booking> {
  const { data } = await api.patch<Booking>(`/bookings/${id}/cancel`, { reason });
  return normalizeBooking(data);
}

export async function deleteBooking(
  id: string,
  scope: DeleteBookingScope = "single",
): Promise<DeleteBookingResponse> {
  const { data } = await api.delete<DeleteBookingResponse>(`/bookings/${id}`, {
    params: { scope },
  });
  return data;
}
