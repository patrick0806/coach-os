export const MOCK_STUDENT_ID = "st-1"

export const trainingScheduleFixtures = {
  empty: [] as object[],

  withSchedules: [
    {
      id: "ts-1",
      tenantId: "mock-tenant-abc123",
      studentId: MOCK_STUDENT_ID,
      studentProgramId: null,
      dayOfWeek: 1, // Monday
      startTime: "08:00",
      endTime: "09:00",
      location: "Academia Central",
      isActive: true,
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "ts-2",
      tenantId: "mock-tenant-abc123",
      studentId: MOCK_STUDENT_ID,
      studentProgramId: null,
      dayOfWeek: 3, // Wednesday
      startTime: "08:00",
      endTime: "09:00",
      location: "Academia Central",
      isActive: true,
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "ts-3",
      tenantId: "mock-tenant-abc123",
      studentId: MOCK_STUDENT_ID,
      studentProgramId: null,
      dayOfWeek: 5, // Friday
      startTime: "10:00",
      endTime: "11:00",
      location: null,
      isActive: true,
      createdAt: "2024-01-15T00:00:00Z",
    },
  ],

  withInactive: [
    {
      id: "ts-1",
      tenantId: "mock-tenant-abc123",
      studentId: MOCK_STUDENT_ID,
      studentProgramId: "prog-1",
      dayOfWeek: 2, // Tuesday
      startTime: "14:00",
      endTime: "15:00",
      location: null,
      isActive: false,
      createdAt: "2024-01-10T00:00:00Z",
    },
  ],

  newSchedule: {
    id: "ts-new",
    tenantId: "mock-tenant-abc123",
    studentId: MOCK_STUDENT_ID,
    studentProgramId: null,
    dayOfWeek: 4, // Thursday
    startTime: "09:00",
    endTime: "10:00",
    location: "Academia XYZ",
    isActive: true,
    createdAt: "2024-01-20T00:00:00Z",
  },
}
