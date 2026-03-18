import { api } from "@/lib/axios"
import type {
  AppointmentItem,
  ApproveAppointmentRequestRequest,
  AvailabilityExceptionItem,
  AvailabilityRuleItem,
  BulkCreateAvailabilityRulesRequest,
  BulkCreateAvailabilityRulesResponse,
  CalendarEntry,
  CreateAppointmentRequest,
  CreateAvailabilityExceptionRequest,
  CreateAvailabilityRuleRequest,
  ListAppointmentRequestsParams,
  ListAppointmentsParams,
  ListAvailabilityExceptionsParams,
  PaginatedAppointmentRequests,
  PaginatedAppointments,
  UpdateAvailabilityRuleRequest,
} from "@/features/scheduling/types/scheduling.types"

export const schedulingService = {
  // Calendar
  getCalendar: async (startDate: string, endDate: string): Promise<CalendarEntry[]> =>
    (await api.get<CalendarEntry[]>("/calendar", { params: { startDate, endDate } })).data,

  // Appointments
  listAppointments: async (params?: ListAppointmentsParams): Promise<PaginatedAppointments> =>
    (await api.get<PaginatedAppointments>("/appointments", { params })).data,

  getAppointment: async (id: string): Promise<AppointmentItem> =>
    (await api.get<AppointmentItem>(`/appointments/${id}`)).data,

  createAppointment: async (data: CreateAppointmentRequest): Promise<AppointmentItem> =>
    (await api.post<AppointmentItem>("/appointments", data)).data,

  cancelAppointment: async (id: string): Promise<void> => {
    await api.patch(`/appointments/${id}/cancel`)
  },

  completeAppointment: async (id: string): Promise<void> => {
    await api.patch(`/appointments/${id}/complete`)
  },

  // Appointment Requests
  listAppointmentRequests: async (
    params?: ListAppointmentRequestsParams
  ): Promise<PaginatedAppointmentRequests> =>
    (await api.get<PaginatedAppointmentRequests>("/appointment-requests", { params })).data,

  approveAppointmentRequest: async (
    id: string,
    data?: ApproveAppointmentRequestRequest
  ): Promise<AppointmentItem> =>
    (await api.patch<AppointmentItem>(`/appointment-requests/${id}/approve`, data ?? {})).data,

  rejectAppointmentRequest: async (id: string): Promise<void> => {
    await api.patch(`/appointment-requests/${id}/reject`)
  },

  // Availability Rules
  listAvailabilityRules: async (): Promise<AvailabilityRuleItem[]> =>
    (await api.get<AvailabilityRuleItem[]>("/availability-rules")).data,

  createAvailabilityRule: async (
    data: CreateAvailabilityRuleRequest
  ): Promise<AvailabilityRuleItem> =>
    (await api.post<AvailabilityRuleItem>("/availability-rules", data)).data,

  bulkCreateAvailabilityRules: async (
    data: BulkCreateAvailabilityRulesRequest
  ): Promise<BulkCreateAvailabilityRulesResponse> =>
    (await api.post<BulkCreateAvailabilityRulesResponse>("/availability-rules/bulk", data)).data,

  updateAvailabilityRule: async (
    id: string,
    data: UpdateAvailabilityRuleRequest
  ): Promise<AvailabilityRuleItem> =>
    (await api.put<AvailabilityRuleItem>(`/availability-rules/${id}`, data)).data,

  deleteAvailabilityRule: async (id: string): Promise<void> => {
    await api.delete(`/availability-rules/${id}`)
  },

  // Availability Exceptions
  listAvailabilityExceptions: async (
    params?: ListAvailabilityExceptionsParams
  ): Promise<AvailabilityExceptionItem[]> =>
    (await api.get<AvailabilityExceptionItem[]>("/availability-exceptions", { params })).data,

  createAvailabilityException: async (
    data: CreateAvailabilityExceptionRequest
  ): Promise<AvailabilityExceptionItem> =>
    (await api.post<AvailabilityExceptionItem>("/availability-exceptions", data)).data,

  deleteAvailabilityException: async (id: string): Promise<void> => {
    await api.delete(`/availability-exceptions/${id}`)
  },
}
