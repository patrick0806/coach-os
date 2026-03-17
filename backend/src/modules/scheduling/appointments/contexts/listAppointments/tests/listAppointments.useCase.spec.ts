import { describe, it, expect, beforeEach, vi } from "vitest";

import { ListAppointmentsUseCase } from "../listAppointments.useCase";

const TENANT_ID = "tenant-id-1";

const makeAppointment = (overrides = {}) => ({
  id: "apt-id",
  tenantId: TENANT_ID,
  studentId: "student-id",
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

describe("ListAppointmentsUseCase", () => {
  let useCase: ListAppointmentsUseCase;
  let repository: ReturnType<typeof makeRepository>;

  beforeEach(() => {
    repository = makeRepository();
    useCase = new ListAppointmentsUseCase(repository as any);
  });

  it("should return paginated appointments", async () => {
    const result = await useCase.execute({}, TENANT_ID);

    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should pass date range filter to repository", async () => {
    await useCase.execute(
      { startDate: "2026-04-01", endDate: "2026-04-30" },
      TENANT_ID,
    );

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      }),
    );
  });

  it("should pass status filter to repository", async () => {
    await useCase.execute({ status: "scheduled" }, TENANT_ID);

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({ status: "scheduled" }),
    );
  });

  it("should pass studentId filter to repository", async () => {
    await useCase.execute({ studentId: "student-id" }, TENANT_ID);

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({ studentId: "student-id" }),
    );
  });

  it("should enforce tenant isolation via repository call", async () => {
    await useCase.execute({}, TENANT_ID);

    expect(repository.findAllByTenantId).toHaveBeenCalledWith(
      TENANT_ID,
      expect.any(Object),
    );
  });
});
