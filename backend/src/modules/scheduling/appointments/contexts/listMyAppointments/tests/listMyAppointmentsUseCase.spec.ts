import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListMyAppointmentsUseCase } from "../listMyAppointmentsUseCase";

const STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TENANT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678902";

const makeAppointment = (overrides = {}) => ({
  id: "apt-id",
  tenantId: TENANT_ID,
  studentId: STUDENT_ID,
  startAt: new Date(),
  endAt: new Date(),
  appointmentType: "presential",
  status: "scheduled",
  meetingUrl: null,
  location: "Academia",
  notes: null,
  cancelledAt: null,
  cancellationReason: null,
  appointmentRequestId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  studentName: "John Doe",
  studentEmail: "john@test.com",
  ...overrides,
});

const makeRepository = () => ({
  findAllByTenantId: vi.fn().mockResolvedValue({
    rows: [makeAppointment()],
    total: 1,
  }),
});

describe("ListMyAppointmentsUseCase", () => {
  let useCase: ListMyAppointmentsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListMyAppointmentsUseCase(repository as any);
  });

  it("should return paginated appointments for the student", async () => {
    const result = await useCase.execute(STUDENT_ID, TENANT_ID, {});

    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should always filter by studentId from the token", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID, {});

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({ studentId: STUDENT_ID }),
    );
  });

  it("should pass date range filters to repository", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID, {
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    });

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      }),
    );
  });

  it("should pass status filter to repository", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID, { status: "scheduled" });

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({ status: "scheduled" }),
    );
  });

  it("should return empty list when no appointments exist", async () => {
    repository.findAllByTenantId.mockResolvedValue({ rows: [], total: 0 });

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, {});

    expect(result.content).toHaveLength(0);
    expect(result.totalElements).toBe(0);
  });

  it("should calculate totalPages correctly", async () => {
    repository.findAllByTenantId.mockResolvedValue({ rows: [], total: 25 });

    const result = await useCase.execute(STUDENT_ID, TENANT_ID, {
      page: "0",
      size: "10",
    });

    expect(result.totalPages).toBe(3);
  });

  it("should enforce tenant isolation via tenantId", async () => {
    await useCase.execute(STUDENT_ID, TENANT_ID, {});

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.any(Object),
    );
  });
});
