export const MOCK_CALENDAR_ENTRIES = [
  {
    type: "appointment",
    date: "2026-03-16",
    startTime: "09:00",
    endTime: "10:00",
    studentId: "student-1",
    studentName: "Ana Lima",
    appointmentType: "presential",
    status: "scheduled",
    location: "Academia Central",
    sourceId: "appt-1",
  },
  {
    type: "training_schedule",
    date: "2026-03-16",
    startTime: "10:00",
    endTime: "11:00",
    studentId: "student-2",
    studentName: "Bruno Souza",
    sourceId: "train-2",
  },
  {
    type: "training_schedule",
    date: "2026-03-17",
    startTime: "07:00",
    endTime: "08:00",
    studentId: "student-2",
    studentName: "Bruno Souza",
    sourceId: "train-1",
  },
  {
    type: "exception",
    date: "2026-03-18",
    reason: "Feriado",
    sourceId: "exc-1",
  },
]

export const MOCK_CALENDAR_EMPTY: typeof MOCK_CALENDAR_ENTRIES = []

export const MOCK_APPOINTMENTS = {
  content: [
    {
      id: "appt-1",
      studentId: "student-1",
      studentName: "Ana Lima",
      startAt: "2026-03-16T09:00:00.000Z",
      endAt: "2026-03-16T10:00:00.000Z",
      type: "presential",
      status: "scheduled",
      location: "Academia Central",
      meetingUrl: null,
      notes: null,
      tenantId: "tenant-1",
      createdAt: "2026-03-01T00:00:00.000Z",
    },
  ],
  page: 0,
  size: 100,
  totalElements: 1,
  totalPages: 1,
}

export const MOCK_APPOINTMENT_REQUESTS_PENDING = {
  content: [
    {
      id: "req-1",
      studentId: "student-2",
      studentName: "Bruno Souza",
      requestedStartAt: "2026-03-20T14:00:00.000Z",
      requestedEndAt: "2026-03-20T15:00:00.000Z",
      type: "online",
      status: "pending",
      notes: "Preciso de acompanhamento nutricional",
      tenantId: "tenant-1",
      createdAt: "2026-03-15T00:00:00.000Z",
    },
  ],
  page: 0,
  size: 50,
  totalElements: 1,
  totalPages: 1,
}

export const MOCK_APPOINTMENT_REQUESTS_EMPTY = {
  content: [],
  page: 0,
  size: 1,
  totalElements: 0,
  totalPages: 0,
}

export const MOCK_AVAILABILITY_RULES = [
  {
    id: "rule-1",
    tenantId: "tenant-1",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "12:00",
    isActive: true,
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "rule-2",
    tenantId: "tenant-1",
    dayOfWeek: 3,
    startTime: "14:00",
    endTime: "18:00",
    isActive: true,
    createdAt: "2026-03-01T00:00:00.000Z",
  },
]

export const MOCK_AVAILABILITY_EXCEPTIONS = [
  {
    id: "exc-1",
    tenantId: "tenant-1",
    date: "2026-03-18",
    reason: "Feriado",
    createdAt: "2026-03-01T00:00:00.000Z",
  },
]

export const MOCK_NEW_APPOINTMENT = {
  id: "appt-new",
  studentId: "student-1",
  studentName: "Ana Lima",
  startAt: "2026-03-25T10:00:00.000Z",
  endAt: "2026-03-25T11:00:00.000Z",
  type: "presential",
  status: "scheduled",
  location: "Academia Central",
  meetingUrl: null,
  notes: null,
  tenantId: "tenant-1",
  createdAt: "2026-03-17T00:00:00.000Z",
}

export const MOCK_STUDENTS_FOR_SELECT = {
  content: [
    { id: "student-1", name: "Ana Lima", email: "ana@test.com", status: "active" },
    { id: "student-2", name: "Bruno Souza", email: "bruno@test.com", status: "active" },
  ],
  page: 0,
  size: 200,
  totalElements: 2,
  totalPages: 1,
}

export const MOCK_NEW_RULE = {
  id: "rule-new",
  tenantId: "tenant-1",
  dayOfWeek: 5,
  startTime: "09:00",
  endTime: "13:00",
  isActive: true,
  createdAt: "2026-03-17T00:00:00.000Z",
}

export const MOCK_NEW_EXCEPTION = {
  id: "exc-new",
  tenantId: "tenant-1",
  date: "2026-04-01",
  reason: "Férias",
  createdAt: "2026-03-17T00:00:00.000Z",
}
