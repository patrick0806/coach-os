# TASK_BOARD.md — Coach OS

Last updated: 2026-03-16

---

## Current Sprint

### Prerequisites (must complete before auth module)

- [x] Implement Passport JWT Strategy (register strategy so JWTAuthGuard can validate tokens)
- [x] Implement TenantAccessGuard (tenant-access.guard.ts — 17 tests passing)
- [x] Implement PersonalsRepository (findById, updateSubscription — required by TenantAccessGuard and RegisterUseCase)

### Module: auth

- [x] Implement RegisterUseCase (create user + personal + Stripe customer + subscription)
- [x] Implement register request/response DTOs with Zod validation
- [x] Implement register controller (POST /auth/register)
- [x] Implement register unit tests
- [x] Implement LoginUseCase (validate credentials, generate JWT + refresh token)
- [x] Implement login request/response DTOs with Zod validation
- [x] Implement login controller (POST /auth/login)
- [x] Implement login unit tests
- [x] Implement RefreshTokenUseCase (rotate refresh token, issue new JWT)
- [x] Implement refresh token controller (POST /auth/refresh)
- [x] Implement refresh token unit tests

---

## Next Tasks

### Module: auth (continued)

- [x] Implement RequestPasswordResetUseCase (generate token, send email via Resend)
- [x] Implement password reset request DTO with Zod validation
- [x] Implement password reset controller (POST /auth/password-reset/request)
- [x] Implement password reset request unit tests
- [x] Implement ResetPasswordUseCase (validate token, update password)
- [x] Implement reset password controller (POST /auth/password-reset/confirm)
- [x] Implement reset password unit tests
- [x] Implement SetupPasswordUseCase (first-time password setup for invited users)
- [x] Implement setup password controller (POST /auth/password-setup)
- [x] Implement setup password unit tests

### Module: platform/plans

- [x] Implement PlanRepository (findAll, findById) — already existed in shared/repositories
- [x] Implement ListPlansUseCase
- [x] Implement list plans response DTO
- [x] Implement list plans controller (GET /plans)
- [x] Implement list plans unit tests (6 tests)
- [x] Implement seed script for default plans (Basic, Pro, Elite) — already existed

### Module: platform/admins

- [ ] Implement AdminRepository (findByUserId)
- [ ] Implement admin guard (restrict routes to ADMIN role)
- [ ] Implement admin module registration

### Database

- [x] Add missing fields to students schema (status, phoneNumber, goal, observations, physicalRestrictions)
- [x] Add missing fields to personals schema (logoUrl, onboardingCompleted, specialties)
- [x] Create studentInvitationTokens schema (id, tenantId, email, tokenHash, expiresAt, usedAt, createdAt)
- [x] Update schema index exports and reset-migrations script
- [x] Generate migration 0001_loose_young_avengers.sql
- [x] Apply database migration (run db:migrate — includes 0000 + 0001)
- [x] Implement seed data script with PRD values (3 plans + 26 global exercises)

---

## Backlog

### Module: platform/subscriptions

- [ ] Implement GetSubscriptionUseCase
- [ ] Implement subscription response DTO
- [ ] Implement get subscription controller (GET /subscriptions/current)
- [ ] Implement get subscription unit tests
- [ ] Implement ChangeSubscriptionPlanUseCase (upgrade/downgrade via Stripe)
- [ ] Implement change plan controller (PATCH /subscriptions/plan)
- [ ] Implement change plan unit tests
- [ ] Implement CancelSubscriptionUseCase
- [ ] Implement cancel subscription controller (POST /subscriptions/cancel)
- [ ] Implement cancel subscription unit tests
- [ ] Implement Stripe webhook handler (subscription.updated, subscription.deleted, invoice.paid)
- [ ] Implement webhook unit tests

### Module: platform/tenants

- [ ] Implement ListTenantsUseCase (admin only)
- [ ] Implement list tenants controller (GET /admin/tenants)
- [ ] Implement list tenants unit tests
- [ ] Implement GetTenantUseCase (admin only)
- [ ] Implement get tenant controller (GET /admin/tenants/:id)
- [ ] Implement get tenant unit tests
- [ ] Implement SuspendTenantUseCase (admin only)
- [ ] Implement suspend tenant controller (PATCH /admin/tenants/:id/suspend)
- [ ] Implement suspend tenant unit tests

### Module: platform/profile

- [ ] Implement GetProfileUseCase
- [ ] Implement profile response DTO
- [ ] Implement get profile controller (GET /profile)
- [ ] Implement get profile unit tests
- [ ] Implement UpdateProfileUseCase
- [ ] Implement update profile request DTO with Zod validation
- [ ] Implement update profile controller (PUT /profile)
- [ ] Implement update profile unit tests

### Module: students ✅ COMPLETE

- [x] Implement StudentRepository (create, findAll, findById, update, countByTenantId, updateStatus)
- [x] Implement CoachStudentRelationsRepository (create, findByTenantId, findById, findByStudentIdAndTenantId, updateStatus)
- [x] Implement StudentInvitationTokensRepository (create, findByTokenHash, findActiveByEmailAndTenant, invalidateByEmailAndTenant, markAsUsed)
- [x] Implement CreateStudentUseCase (9 tests — limit enforcement, email uniqueness, STUDENT role, relation creation)
- [x] Implement ListStudentsUseCase (6 tests — pagination, search, status filter, totalPages)
- [x] Implement GetStudentUseCase (4 tests — found, not found, tenant isolation)
- [x] Implement UpdateStudentUseCase (5 tests — partial update, not found, wrong tenant)
- [x] Implement UpdateStudentStatusUseCase (6 tests — all statuses, archive updates relation)
- [x] Implement InviteStudentUseCase (7 tests — email, limit, duplicate, token expiry)
- [x] Implement GenerateInviteLinkUseCase (6 tests — link format, token creation, limit)
- [x] Implement AcceptInviteUseCase (12 tests — valid, expired, used, limit, password hashing)
- [x] Implement student limit enforcement (check plan maxStudents)

### Module: coaching/notes ✅ COMPLETE

- [x] Implement StudentNotesRepository (create, findByStudentId, findById, update, delete)
- [x] Implement CreateNoteUseCase (4 tests)
- [x] Implement ListNotesUseCase (3 tests — ordered, empty, student not found)
- [x] Implement UpdateNoteUseCase (4 tests — happy path, not found, wrong tenant, validation)
- [x] Implement DeleteNoteUseCase (3 tests — happy path, not found, wrong tenant)

### Module: coaching/relations ✅ COMPLETE

- [x] Implement CoachStudentRelationRepository (create, findByTenantId, findById, findByStudentIdAndTenantId, updateStatus)
- [x] Implement ListRelationsUseCase (3 tests — returns relations with student info)
- [x] Implement UpdateRelationStatusUseCase (5 tests — status update, archive sets endDate, validation)

### Module: exercises

- [ ] Implement ExerciseRepository (create, findAll, findById, update, delete)
- [ ] Implement CreateExerciseUseCase (private exercise, scoped to coach)
- [ ] Implement create exercise request/response DTOs with Zod validation
- [ ] Implement create exercise controller (POST /exercises)
- [ ] Implement create exercise unit tests
- [ ] Implement ListExercisesUseCase (global + coach private, with filters)
- [ ] Implement list exercises response DTO
- [ ] Implement list exercises controller (GET /exercises)
- [ ] Implement list exercises unit tests
- [ ] Implement GetExerciseUseCase
- [ ] Implement get exercise controller (GET /exercises/:id)
- [ ] Implement get exercise unit tests
- [ ] Implement UpdateExerciseUseCase (only own private exercises)
- [ ] Implement update exercise request DTO with Zod validation
- [ ] Implement update exercise controller (PUT /exercises/:id)
- [ ] Implement update exercise unit tests
- [ ] Implement DeleteExerciseUseCase (only own private exercises)
- [ ] Implement delete exercise controller (DELETE /exercises/:id)
- [ ] Implement delete exercise unit tests
- [ ] Implement exercise media upload (generate presigned URL for S3)
- [ ] Implement media upload controller (POST /exercises/:id/upload-url)
- [ ] Implement media upload unit tests

### Module: training/programTemplates

- [ ] Implement ProgramTemplateRepository (create, findAll, findById, update, delete, duplicate)
- [ ] Implement CreateProgramTemplateUseCase
- [ ] Implement create program template request/response DTOs with Zod validation
- [ ] Implement create program template controller (POST /program-templates)
- [ ] Implement create program template unit tests
- [ ] Implement ListProgramTemplatesUseCase (tenant-scoped, with pagination)
- [ ] Implement list program templates controller (GET /program-templates)
- [ ] Implement list program templates unit tests
- [ ] Implement GetProgramTemplateUseCase (with workout templates and exercises)
- [ ] Implement get program template controller (GET /program-templates/:id)
- [ ] Implement get program template unit tests
- [ ] Implement UpdateProgramTemplateUseCase
- [ ] Implement update program template request DTO
- [ ] Implement update program template controller (PUT /program-templates/:id)
- [ ] Implement update program template unit tests
- [ ] Implement DuplicateProgramTemplateUseCase (deep copy)
- [ ] Implement duplicate program template controller (POST /program-templates/:id/duplicate)
- [ ] Implement duplicate program template unit tests
- [ ] Implement DeleteProgramTemplateUseCase
- [ ] Implement delete program template controller (DELETE /program-templates/:id)
- [ ] Implement delete program template unit tests

### Module: training/workoutTemplates

- [ ] Implement WorkoutTemplateRepository (create, findById, update, delete, reorder)
- [ ] Implement AddWorkoutTemplateUseCase
- [ ] Implement add workout template request/response DTOs with Zod validation
- [ ] Implement add workout template controller (POST /program-templates/:id/workouts)
- [ ] Implement add workout template unit tests
- [ ] Implement UpdateWorkoutTemplateUseCase
- [ ] Implement update workout template controller (PUT /workout-templates/:id)
- [ ] Implement update workout template unit tests
- [ ] Implement DeleteWorkoutTemplateUseCase
- [ ] Implement delete workout template controller (DELETE /workout-templates/:id)
- [ ] Implement delete workout template unit tests
- [ ] Implement ReorderWorkoutTemplatesUseCase
- [ ] Implement reorder workout templates controller (PATCH /program-templates/:id/workouts/reorder)
- [ ] Implement reorder workout templates unit tests

### Module: training/exerciseTemplates

- [ ] Implement ExerciseTemplateRepository (create, findById, update, delete, reorder)
- [ ] Implement AddExerciseTemplateUseCase
- [ ] Implement add exercise template request/response DTOs with Zod validation
- [ ] Implement add exercise template controller (POST /workout-templates/:id/exercises)
- [ ] Implement add exercise template unit tests
- [ ] Implement UpdateExerciseTemplateUseCase
- [ ] Implement update exercise template controller (PUT /exercise-templates/:id)
- [ ] Implement update exercise template unit tests
- [ ] Implement DeleteExerciseTemplateUseCase
- [ ] Implement delete exercise template controller (DELETE /exercise-templates/:id)
- [ ] Implement delete exercise template unit tests
- [ ] Implement ReorderExerciseTemplatesUseCase
- [ ] Implement reorder exercise templates controller (PATCH /workout-templates/:id/exercises/reorder)
- [ ] Implement reorder exercise templates unit tests

### Module: training/studentPrograms

- [ ] Implement StudentProgramRepository (create, findAll, findById, update)
- [ ] Implement AssignProgramUseCase (snapshot template into student program)
- [ ] Implement assign program request/response DTOs with Zod validation
- [ ] Implement assign program controller (POST /students/:studentId/programs)
- [ ] Implement assign program unit tests
- [ ] Implement ListStudentProgramsUseCase (tenant-scoped)
- [ ] Implement list student programs controller (GET /students/:studentId/programs)
- [ ] Implement list student programs unit tests
- [ ] Implement GetStudentProgramUseCase (with workout days and exercises)
- [ ] Implement get student program controller (GET /student-programs/:id)
- [ ] Implement get student program unit tests
- [ ] Implement UpdateStudentProgramStatusUseCase (active, finished, cancelled)
- [ ] Implement update program status controller (PATCH /student-programs/:id/status)
- [ ] Implement update program status unit tests

### Module: training/workoutDays

- [ ] Implement WorkoutDayRepository (findById, update, reorder)
- [ ] Implement UpdateWorkoutDayUseCase
- [ ] Implement update workout day request DTO with Zod validation
- [ ] Implement update workout day controller (PUT /workout-days/:id)
- [ ] Implement update workout day unit tests

### Module: training/studentExercises

- [ ] Implement StudentExerciseRepository (findById, update)
- [ ] Implement UpdateStudentExerciseUseCase (weight, reps, rest, duration)
- [ ] Implement update student exercise request DTO with Zod validation
- [ ] Implement update student exercise controller (PUT /student-exercises/:id)
- [ ] Implement update student exercise unit tests

### Module: workoutExecution/sessions

- [ ] Implement WorkoutSessionRepository (create, findById, findByStudentId, update)
- [ ] Implement StartWorkoutSessionUseCase
- [ ] Implement start session request/response DTOs with Zod validation
- [ ] Implement start session controller (POST /workout-sessions)
- [ ] Implement start session unit tests
- [ ] Implement PauseWorkoutSessionUseCase
- [ ] Implement pause session controller (PATCH /workout-sessions/:id/pause)
- [ ] Implement pause session unit tests
- [ ] Implement FinishWorkoutSessionUseCase
- [ ] Implement finish session controller (PATCH /workout-sessions/:id/finish)
- [ ] Implement finish session unit tests
- [ ] Implement ListWorkoutSessionsUseCase (by student, with pagination)
- [ ] Implement list sessions controller (GET /students/:studentId/workout-sessions)
- [ ] Implement list sessions unit tests
- [ ] Implement GetWorkoutSessionUseCase (with executions and sets)
- [ ] Implement get session controller (GET /workout-sessions/:id)
- [ ] Implement get session unit tests

### Module: workoutExecution/exerciseExecutions

- [ ] Implement ExerciseExecutionRepository (create, findById, update)
- [ ] Implement CreateExerciseExecutionUseCase
- [ ] Implement create execution request/response DTOs with Zod validation
- [ ] Implement create execution controller (POST /exercise-executions)
- [ ] Implement create execution unit tests

### Module: workoutExecution/exerciseSets

- [ ] Implement ExerciseSetRepository (create, findByExecutionId)
- [ ] Implement RecordExerciseSetUseCase
- [ ] Implement record set request/response DTOs with Zod validation
- [ ] Implement record set controller (POST /exercise-sets)
- [ ] Implement record set unit tests

### Module: progress/records

- [ ] Implement ProgressRecordRepository (create, findByStudentId)
- [ ] Implement CreateProgressRecordUseCase
- [ ] Implement create progress record request/response DTOs with Zod validation
- [ ] Implement create progress record controller (POST /students/:studentId/progress-records)
- [ ] Implement create progress record unit tests
- [ ] Implement ListProgressRecordsUseCase (chronological, by metric type)
- [ ] Implement list progress records controller (GET /students/:studentId/progress-records)
- [ ] Implement list progress records unit tests

### Module: progress/photos

- [ ] Implement ProgressPhotoRepository (create, findByStudentId)
- [ ] Implement RequestPhotoUploadUseCase (generate presigned URL)
- [ ] Implement request photo upload controller (POST /students/:studentId/progress-photos/upload-url)
- [ ] Implement request photo upload unit tests
- [ ] Implement SaveProgressPhotoUseCase (store metadata after upload)
- [ ] Implement save progress photo controller (POST /students/:studentId/progress-photos)
- [ ] Implement save progress photo unit tests
- [ ] Implement ListProgressPhotosUseCase (chronological)
- [ ] Implement list progress photos controller (GET /students/:studentId/progress-photos)
- [ ] Implement list progress photos unit tests

### Module: scheduling/availability

- [ ] Implement AvailabilityRuleRepository (create, findByTenantId, update, delete)
- [ ] Implement CreateAvailabilityRuleUseCase
- [ ] Implement create availability rule request/response DTOs with Zod validation
- [ ] Implement create availability rule controller (POST /availability-rules)
- [ ] Implement create availability rule unit tests
- [ ] Implement ListAvailabilityRulesUseCase
- [ ] Implement list availability rules controller (GET /availability-rules)
- [ ] Implement list availability rules unit tests
- [ ] Implement UpdateAvailabilityRuleUseCase
- [ ] Implement update availability rule controller (PUT /availability-rules/:id)
- [ ] Implement update availability rule unit tests
- [ ] Implement DeleteAvailabilityRuleUseCase
- [ ] Implement delete availability rule controller (DELETE /availability-rules/:id)
- [ ] Implement delete availability rule unit tests

### Module: scheduling/exceptions

- [ ] Implement AvailabilityExceptionRepository (create, findByTenantId, delete)
- [ ] Implement CreateAvailabilityExceptionUseCase
- [ ] Implement create exception request/response DTOs with Zod validation
- [ ] Implement create exception controller (POST /availability-exceptions)
- [ ] Implement create exception unit tests
- [ ] Implement ListAvailabilityExceptionsUseCase
- [ ] Implement list exceptions controller (GET /availability-exceptions)
- [ ] Implement list exceptions unit tests
- [ ] Implement DeleteAvailabilityExceptionUseCase
- [ ] Implement delete exception controller (DELETE /availability-exceptions/:id)
- [ ] Implement delete exception unit tests

### Module: scheduling/appointmentRequests

- [ ] Implement AppointmentRequestRepository (create, findByTenantId, findById, update)
- [ ] Implement CreateAppointmentRequestUseCase (student requests appointment)
- [ ] Implement create request DTOs with Zod validation
- [ ] Implement create request controller (POST /appointment-requests)
- [ ] Implement create request unit tests
- [ ] Implement ListAppointmentRequestsUseCase
- [ ] Implement list requests controller (GET /appointment-requests)
- [ ] Implement list requests unit tests
- [ ] Implement ApproveAppointmentRequestUseCase (creates appointment)
- [ ] Implement approve request controller (PATCH /appointment-requests/:id/approve)
- [ ] Implement approve request unit tests
- [ ] Implement RejectAppointmentRequestUseCase
- [ ] Implement reject request controller (PATCH /appointment-requests/:id/reject)
- [ ] Implement reject request unit tests

### Module: scheduling/appointments

- [ ] Implement AppointmentRepository (create, findByTenantId, findById, update)
- [ ] Implement CreateAppointmentUseCase (coach manual creation, with overlap check)
- [ ] Implement create appointment request/response DTOs with Zod validation
- [ ] Implement create appointment controller (POST /appointments)
- [ ] Implement create appointment unit tests
- [ ] Implement ListAppointmentsUseCase (with date filters, pagination)
- [ ] Implement list appointments controller (GET /appointments)
- [ ] Implement list appointments unit tests
- [ ] Implement GetAppointmentUseCase
- [ ] Implement get appointment controller (GET /appointments/:id)
- [ ] Implement get appointment unit tests
- [ ] Implement CancelAppointmentUseCase (with cancellation reason)
- [ ] Implement cancel appointment controller (PATCH /appointments/:id/cancel)
- [ ] Implement cancel appointment unit tests
- [ ] Implement overlap prevention logic (shared validation)
- [ ] Implement available slots query (GET /appointments/available-slots)
- [ ] Implement available slots unit tests

### Module: coaching/servicePlans

- [ ] Implement ServicePlanRepository (create, findByTenantId, findById, update)
- [ ] Implement CreateServicePlanUseCase
- [ ] Implement create service plan request/response DTOs with Zod validation
- [ ] Implement create service plan controller (POST /service-plans)
- [ ] Implement create service plan unit tests
- [ ] Implement ListServicePlansUseCase
- [ ] Implement list service plans controller (GET /service-plans)
- [ ] Implement list service plans unit tests
- [ ] Implement UpdateServicePlanUseCase
- [ ] Implement update service plan controller (PUT /service-plans/:id)
- [ ] Implement update service plan unit tests

### Module: coaching/contracts

- [ ] Implement CoachingContractRepository (create, findByTenantId, findById, update)
- [ ] Implement CreateCoachingContractUseCase
- [ ] Implement create contract request/response DTOs with Zod validation
- [ ] Implement create contract controller (POST /coaching-contracts)
- [ ] Implement create contract unit tests
- [ ] Implement ListCoachingContractsUseCase
- [ ] Implement list contracts controller (GET /coaching-contracts)
- [ ] Implement list contracts unit tests
- [ ] Implement CancelCoachingContractUseCase
- [ ] Implement cancel contract controller (PATCH /coaching-contracts/:id/cancel)
- [ ] Implement cancel contract unit tests

### Frontend: auth

- [ ] Implement auth service (register, login, refresh, password reset)
- [ ] Implement registration page with plan selection
- [ ] Implement login page
- [ ] Implement password recovery page
- [ ] Implement password reset page
- [ ] Implement session management (store JWT, refresh token rotation)
- [ ] Implement auth guard (redirect unauthenticated users)
- [ ] Implement onboarding wizard flow

### Frontend: dashboard

- [ ] Implement dashboard layout (sidebar, header, content area)
- [ ] Implement dashboard home page (overview stats)

### Frontend: students

- [ ] Implement students service (CRUD, invite, status)
- [ ] Implement student list page (with pagination, search, filters)
- [ ] Implement create student form
- [ ] Implement student detail page
- [ ] Implement edit student form
- [ ] Implement invite student dialog
- [ ] Implement student status management
- [ ] Implement student notes section

### Frontend: exercises

- [ ] Implement exercises service (CRUD, upload)
- [ ] Implement exercise library page (with search, muscle group filter)
- [ ] Implement create exercise form (with media upload)
- [ ] Implement exercise detail dialog
- [ ] Implement edit exercise form

### Frontend: training templates

- [ ] Implement training templates service
- [ ] Implement program template list page
- [ ] Implement create program template form
- [ ] Implement program template builder (add/edit/reorder workouts and exercises)
- [ ] Implement duplicate program template action

### Frontend: student programs

- [ ] Implement student programs service
- [ ] Implement assign program dialog (select template for student)
- [ ] Implement student program detail page (workout days, exercises)
- [ ] Implement customize student exercise form

### Frontend: workout execution

- [ ] Implement workout execution service
- [ ] Implement workout session page (start, record sets, finish)
- [ ] Implement workout history page

### Frontend: progress

- [ ] Implement progress service
- [ ] Implement progress records page (record metrics, view history)
- [ ] Implement progress photos page (upload, gallery)
- [ ] Implement progress charts (line graphs, comparisons)

### Frontend: scheduling

- [ ] Implement scheduling service
- [ ] Implement availability settings page (manage rules and exceptions)
- [ ] Implement appointments page (calendar view, list view)
- [ ] Implement create appointment dialog
- [ ] Implement appointment request management

### Frontend: coaching services

- [ ] Implement coaching service
- [ ] Implement service plans page (create, edit, list)
- [ ] Implement coaching contracts page (create, list, manage)

### Frontend: public page

- [ ] Implement public page service
- [ ] Implement public page editor (bio, photo, specialties, colors)
- [ ] Implement public page preview
- [ ] Implement public page rendering (app.com/personal/:slug)

### Frontend: student portal

- [ ] Implement student portal layout
- [ ] Implement student login page
- [ ] Implement student training page (view program, exercises)
- [ ] Implement student workout execution page
- [ ] Implement student progress page
- [ ] Implement student appointments page

### Frontend: notifications

- [ ] Implement notification preferences page

---

## Completed

### Infrastructure

- [x] Backend project setup (NestJS + Fastify + SWC)
- [x] Frontend project setup (Next.js)
- [x] Database configuration (Drizzle ORM + PostgreSQL)
- [x] Database schema definition (27 tables across 12 schema files)
- [x] Migration generation (0000_mushy_black_bolt.sql)
- [x] Migration reset script
- [x] Shared guards (JWTAuth, Roles)
- [x] Shared filters (HttpException, ValidationException, AllExceptions)
- [x] Shared interceptors (BuildResponse)
- [x] Shared decorators (Public, Roles, CurrentUser, BypassTenantAccess)
- [x] Shared providers (Drizzle, Stripe, S3, Resend, LogBuilder)
- [x] Shared utils (date, validation, token, slug, requestDuration, getHeader)
- [x] Shared enums (ApplicationRoles: ADMIN, PERSONAL, STUDENT)
- [x] Shared exceptions (Validation, TenantBlocked)
- [x] Environment configuration
- [x] Swagger configuration
- [x] Pino logger configuration
- [x] Health module (GET /health)
- [x] App module with global guards (JWT + Roles)
