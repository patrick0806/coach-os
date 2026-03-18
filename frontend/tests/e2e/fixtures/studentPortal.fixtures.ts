export const MOCK_STUDENT_PORTAL_ID = "student-portal-abc123"
export const MOCK_STUDENT_PORTAL_TENANT_ID = "tenant-portal-abc123"

// =============================================================================
// Progress Checkins
// =============================================================================

const makeCheckin = (overrides: object = {}) => ({
  id: "checkin-1",
  tenantId: MOCK_STUDENT_PORTAL_TENANT_ID,
  studentId: MOCK_STUDENT_PORTAL_ID,
  checkinDate: "2026-01-15",
  notes: null,
  records: [],
  photos: [],
  createdAt: "2026-01-15T08:00:00Z",
  updatedAt: "2026-01-15T08:00:00Z",
  ...overrides,
})

const checkinWithMetrics = makeCheckin({
  id: "checkin-1",
  checkinDate: "2026-01-15",
  records: [
    {
      id: "record-1",
      metricType: "weight",
      value: "80.50",
      unit: "kg",
      notes: null,
    },
    {
      id: "record-2",
      metricType: "waist",
      value: "85.00",
      unit: "cm",
      notes: null,
    },
  ],
  photos: [],
})

const checkinWithPhotos = makeCheckin({
  id: "checkin-2",
  checkinDate: "2026-02-01",
  records: [],
  photos: [
    {
      id: "photo-1",
      mediaUrl: "https://s3.example.com/photos/progress-1.jpg",
      notes: null,
    },
  ],
})

const newCheckin = makeCheckin({
  id: "checkin-new",
  checkinDate: "2026-03-15",
  records: [
    {
      id: "record-new",
      metricType: "weight",
      value: "79.00",
      unit: "kg",
      notes: null,
    },
  ],
})

function paginated(content: object[], size = 20) {
  return {
    content,
    page: 0,
    size,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size) || 1,
  }
}

export const studentCheckinFixtures = {
  empty: paginated([]),
  withCheckins: paginated([checkinWithMetrics, checkinWithPhotos]),
  single: paginated([checkinWithMetrics]),
  afterCreate: paginated([newCheckin, checkinWithMetrics, checkinWithPhotos]),
}

// =============================================================================
// Appointments
// =============================================================================

const makeAppointment = (overrides: object = {}) => ({
  id: "appt-1",
  tenantId: MOCK_STUDENT_PORTAL_TENANT_ID,
  studentId: MOCK_STUDENT_PORTAL_ID,
  startAt: "2026-03-20T10:00:00Z",
  endAt: "2026-03-20T11:00:00Z",
  appointmentType: "presential" as const,
  status: "scheduled" as const,
  meetingUrl: null,
  location: "Academia Central",
  notes: null,
  createdAt: "2026-03-01T00:00:00Z",
  updatedAt: "2026-03-01T00:00:00Z",
  studentName: "João Aluno",
  studentEmail: "joao@aluno.com",
  ...overrides,
})

export const studentAppointmentFixtures = {
  empty: paginated([]),
  scheduled: paginated([
    makeAppointment({
      id: "appt-1",
      startAt: "2026-03-20T10:00:00Z",
      endAt: "2026-03-20T11:00:00Z",
      appointmentType: "presential",
      status: "scheduled",
      location: "Academia Central",
    }),
  ]),
  online: paginated([
    makeAppointment({
      id: "appt-2",
      startAt: "2026-03-22T14:00:00Z",
      endAt: "2026-03-22T15:00:00Z",
      appointmentType: "online",
      status: "scheduled",
      location: null,
      meetingUrl: "https://meet.example.com/abc123",
    }),
  ]),
  multiple: paginated([
    makeAppointment({ id: "appt-1", status: "scheduled", location: "Academia Central" }),
    makeAppointment({
      id: "appt-2",
      startAt: "2026-03-22T14:00:00Z",
      endAt: "2026-03-22T15:00:00Z",
      appointmentType: "online",
      status: "scheduled",
      location: null,
      meetingUrl: "https://meet.example.com/abc123",
    }),
    makeAppointment({
      id: "appt-3",
      startAt: "2026-03-25T09:00:00Z",
      endAt: "2026-03-25T10:00:00Z",
      status: "completed",
      location: "Parque da Cidade",
    }),
  ]),
}

// =============================================================================
// Training Schedules
// =============================================================================

const makeSchedule = (overrides: object = {}) => ({
  id: "schedule-1",
  tenantId: MOCK_STUDENT_PORTAL_TENANT_ID,
  studentId: MOCK_STUDENT_PORTAL_ID,
  studentProgramId: null,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "09:00",
  location: "Academia Central",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
})

export const studentScheduleFixtures = {
  empty: [],
  withSchedules: [
    makeSchedule({ id: "schedule-1", dayOfWeek: 1, startTime: "08:00", endTime: "09:00", location: "Academia Central" }),
    makeSchedule({ id: "schedule-2", dayOfWeek: 3, startTime: "08:00", endTime: "09:00", location: null }),
    makeSchedule({ id: "schedule-3", dayOfWeek: 5, startTime: "10:00", endTime: "11:00", location: "Academia Central" }),
  ],
  singleDay: [
    makeSchedule({ id: "schedule-1", dayOfWeek: 2, startTime: "07:00", endTime: "08:30", location: "Parque do Ibirapuera" }),
  ],
}
