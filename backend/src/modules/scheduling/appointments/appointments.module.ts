import { Module } from "@nestjs/common";

import { AppointmentsRepository } from "@shared/repositories/appointments.repository";
import { AppointmentRequestsRepository } from "@shared/repositories/appointmentRequests.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";
import { AvailabilityExceptionsRepository } from "@shared/repositories/availabilityExceptions.repository";
import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";

import { CreateAppointmentController } from "./contexts/createAppointment/createAppointment.controller";
import { CreateAppointmentUseCase } from "./contexts/createAppointment/createAppointment.useCase";
import { ListAppointmentsController } from "./contexts/listAppointments/listAppointments.controller";
import { ListAppointmentsUseCase } from "./contexts/listAppointments/listAppointments.useCase";
import { GetAppointmentController } from "./contexts/getAppointment/getAppointment.controller";
import { GetAppointmentUseCase } from "./contexts/getAppointment/getAppointment.useCase";
import { CancelAppointmentController } from "./contexts/cancelAppointment/cancelAppointment.controller";
import { CancelAppointmentUseCase } from "./contexts/cancelAppointment/cancelAppointment.useCase";
import { CompleteAppointmentController } from "./contexts/completeAppointment/completeAppointment.controller";
import { CompleteAppointmentUseCase } from "./contexts/completeAppointment/completeAppointment.useCase";
import { CreateAppointmentRequestController } from "./contexts/createRequest/createRequest.controller";
import { CreateAppointmentRequestUseCase } from "./contexts/createRequest/createRequest.useCase";
import { ListAppointmentRequestsController } from "./contexts/listRequests/listRequests.controller";
import { ListAppointmentRequestsUseCase } from "./contexts/listRequests/listRequests.useCase";
import { ApproveAppointmentRequestController } from "./contexts/approveRequest/approveRequest.controller";
import { ApproveAppointmentRequestUseCase } from "./contexts/approveRequest/approveRequest.useCase";
import { RejectAppointmentRequestController } from "./contexts/rejectRequest/rejectRequest.controller";
import { RejectAppointmentRequestUseCase } from "./contexts/rejectRequest/rejectRequest.useCase";
import { ListMyAppointmentsController } from "./contexts/listMyAppointments/listMyAppointmentsController";
import { ListMyAppointmentsUseCase } from "./contexts/listMyAppointments/listMyAppointmentsUseCase";

@Module({
  controllers: [
    CreateAppointmentController,
    ListAppointmentsController,
    GetAppointmentController,
    CancelAppointmentController,
    CompleteAppointmentController,
    CreateAppointmentRequestController,
    ListAppointmentRequestsController,
    ApproveAppointmentRequestController,
    RejectAppointmentRequestController,
    ListMyAppointmentsController,
  ],
  providers: [
    AppointmentsRepository,
    AppointmentRequestsRepository,
    StudentsRepository,
    AvailabilityRulesRepository,
    AvailabilityExceptionsRepository,
    TrainingSchedulesRepository,
    CreateAppointmentUseCase,
    ListAppointmentsUseCase,
    GetAppointmentUseCase,
    CancelAppointmentUseCase,
    CompleteAppointmentUseCase,
    CreateAppointmentRequestUseCase,
    ListAppointmentRequestsUseCase,
    ApproveAppointmentRequestUseCase,
    RejectAppointmentRequestUseCase,
    ListMyAppointmentsUseCase,
  ],
  exports: [AppointmentsRepository, AppointmentRequestsRepository],
})
export class AppointmentsModule {}
