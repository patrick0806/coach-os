export const MOCK_STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891"

const makeCheckin = (overrides: Partial<{
  id: string
  checkinDate: string
  records: { id: string; metricType: string; value: string; unit: string; notes: string | null }[]
  photos: { id: string; mediaUrl: string; notes: string | null }[]
  notes: string | null
}> = {}) => ({
  id: "checkin-1",
  tenantId: "tenant-1",
  studentId: MOCK_STUDENT_ID,
  checkinDate: "2026-01-15",
  notes: null,
  records: [],
  photos: [],
  createdAt: "2026-01-15T08:00:00Z",
  updatedAt: "2026-01-15T08:00:00Z",
  ...overrides,
})

export const progressCheckinsFixtures = {
  empty: {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },

  withCheckins: {
    content: [
      makeCheckin({
        id: "checkin-1",
        checkinDate: "2026-01-15",
        records: [
          { id: "r1", metricType: "weight", value: "80.00", unit: "kg", notes: null },
          { id: "r2", metricType: "waist", value: "82.00", unit: "cm", notes: null },
        ],
        photos: [],
      }),
      makeCheckin({
        id: "checkin-2",
        checkinDate: "2026-01-08",
        records: [
          { id: "r3", metricType: "weight", value: "81.50", unit: "kg", notes: null },
        ],
        photos: [
          { id: "p1", mediaUrl: "https://example.com/photo.jpg", notes: null },
        ],
      }),
    ],
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1,
  },

  afterCreate: {
    content: [
      makeCheckin({
        id: "checkin-new",
        checkinDate: "2026-01-20",
        records: [
          { id: "r-new", metricType: "weight", value: "79.50", unit: "kg", notes: null },
        ],
        photos: [],
      }),
      makeCheckin({
        id: "checkin-1",
        checkinDate: "2026-01-15",
        records: [
          { id: "r1", metricType: "weight", value: "80.00", unit: "kg", notes: null },
        ],
        photos: [],
      }),
    ],
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1,
  },

  newCheckin: makeCheckin({
    id: "checkin-new",
    checkinDate: "2026-01-20",
    records: [
      { id: "r-new", metricType: "weight", value: "79.50", unit: "kg", notes: null },
    ],
    photos: [],
  }),
}
