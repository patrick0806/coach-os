# TASK_BOARD.md — Coach OS

Last updated: 2026-03-18

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

### Module: exercises ✅ COMPLETE

- [x] Implement ExerciseRepository (create, findAllVisible, findById, update, delete)
- [x] Implement CreateExerciseUseCase (private exercise, scoped to coach — 6 tests)
- [x] Implement create exercise request/response DTOs with Zod validation
- [x] Implement create exercise controller (POST /exercises)
- [x] Implement ListExercisesUseCase (global + coach private, with filters — 6 tests)
- [x] Implement list exercises response DTO
- [x] Implement list exercises controller (GET /exercises)
- [x] Implement GetExerciseUseCase (global visible to all, private tenant-scoped — 4 tests)
- [x] Implement get exercise controller (GET /exercises/:id)
- [x] Implement UpdateExerciseUseCase (only own private exercises — 6 tests)
- [x] Implement update exercise request/response DTOs with Zod validation
- [x] Implement update exercise controller (PUT /exercises/:id)
- [x] Implement DeleteExerciseUseCase (only own private exercises — 5 tests)
- [x] Implement delete exercise controller (DELETE /exercises/:id)
- [x] Implement RequestUploadUrlUseCase (S3 presigned URL, mime validation — 6 tests)
- [x] Implement media upload controller (POST /exercises/:id/upload-url)

### Module: training/programTemplates ✅ COMPLETE

- [x] Implement ProgramTemplateRepository (create, findAllByTenantId, findById, findByIdWithTree, update, delete)
- [x] Implement CreateProgramTemplateUseCase (5 tests — happy path, tenantId, validation)
- [x] Implement create program template controller (POST /program-templates)
- [x] Implement ListProgramTemplatesUseCase (5 tests — pagination, search, status filter, totalPages)
- [x] Implement list program templates controller (GET /program-templates)
- [x] Implement GetProgramTemplateUseCase (4 tests — with full tree, not found, different tenant, empty tree)
- [x] Implement get program template controller (GET /program-templates/:id)
- [x] Implement UpdateProgramTemplateUseCase (5 tests — happy path, not found, different tenant, partial, validation)
- [x] Implement update program template controller (PUT /program-templates/:id)
- [x] Implement DuplicateProgramTemplateUseCase (4 tests — deep copy with "(cópia)" suffix)
- [x] Implement duplicate program template controller (POST /program-templates/:id/duplicate)
- [x] Implement DeleteProgramTemplateUseCase (3 tests — happy path, not found, different tenant)
- [x] Implement delete program template controller (DELETE /program-templates/:id)
- [x] Implement AddWorkoutTemplateUseCase (5 tests — auto-order, tenant check, validation)
- [x] Implement add workout template controller (POST /program-templates/:id/workouts)
- [x] Implement ReorderWorkoutTemplatesUseCase (4 tests — happy path, not found, different tenant, empty array)
- [x] Implement reorder workout templates controller (PATCH /program-templates/:id/workouts/reorder)

### Module: training/workoutTemplates ✅ COMPLETE

- [x] Implement WorkoutTemplatesRepository (create, findById, findByIdWithTenant, findMaxOrderByProgramTemplateId, update, delete, reorder)
- [x] Implement UpdateWorkoutTemplateUseCase (5 tests — happy path, not found, different tenant, partial, validation)
- [x] Implement update workout template controller (PUT /workout-templates/:id)
- [x] Implement DeleteWorkoutTemplateUseCase (3 tests — happy path, not found, different tenant)
- [x] Implement delete workout template controller (DELETE /workout-templates/:id)
- [x] Implement AddExerciseTemplateUseCase (6 tests — auto-order, exercise visibility, tenant check, validation)
- [x] Implement add exercise template controller (POST /workout-templates/:id/exercises)
- [x] Implement ReorderExerciseTemplatesUseCase (4 tests — happy path, not found, different tenant, empty array)
- [x] Implement reorder exercise templates controller (PATCH /workout-templates/:id/exercises/reorder)

### Module: training/exerciseTemplates ✅ COMPLETE

- [x] Implement ExerciseTemplatesRepository (create, findById, findByIdWithTenant, findMaxOrderByWorkoutTemplateId, update, delete, reorder)
- [x] Implement UpdateExerciseTemplateUseCase (5 tests — happy path, not found, different tenant, partial, validation)
- [x] Implement update exercise template controller (PUT /exercise-templates/:id)
- [x] Implement DeleteExerciseTemplateUseCase (3 tests — happy path, not found, different tenant)
- [x] Implement delete exercise template controller (DELETE /exercise-templates/:id)

### Module: training/studentPrograms ✅ COMPLETE

- [x] Implement StudentProgramRepository (create, findAllByStudentAndTenant, findById, findByIdWithTree, updateStatus)
- [x] Implement AssignProgramUseCase (snapshot template into student program — 6 tests)
- [x] Implement assign program request/response DTOs with Zod validation
- [x] Implement assign program controller (POST /students/:studentId/programs)
- [x] Implement ListStudentProgramsUseCase (tenant-scoped, pagination, status filter — 5 tests)
- [x] Implement list student programs controller (GET /students/:studentId/programs)
- [x] Implement GetStudentProgramUseCase (with workout days and exercises — 5 tests)
- [x] Implement get student program controller (GET /student-programs/:id)
- [x] Implement UpdateStudentProgramStatusUseCase (active, finished, cancelled — 5 tests)
- [x] Implement update program status controller (PATCH /student-programs/:id/status)

### Module: training/workoutDays ✅ COMPLETE

- [x] Implement WorkoutDayRepository (create, findByIdWithTenant, update)
- [x] Implement UpdateWorkoutDayUseCase (5 tests — happy path, not found, wrong tenant, partial, order)
- [x] Implement update workout day request/response DTOs with Zod validation
- [x] Implement update workout day controller (PUT /workout-days/:id)

### Module: training/studentExercises ✅ COMPLETE

- [x] Implement StudentExerciseRepository (create, findByIdWithTenant, update)
- [x] Implement UpdateStudentExerciseUseCase (weight, reps, rest, duration, notes — 5 tests)
- [x] Implement update student exercise request/response DTOs with Zod validation
- [x] Implement update student exercise controller (PUT /student-exercises/:id)

### Module: workoutExecution/sessions ✅ COMPLETE

- [x] Implement WorkoutSessionRepository (create, findById, findByIdWithExecutions, findAllByStudentId, update)
- [x] Implement StartWorkoutSessionUseCase (6 tests — validates student + workout day tenant, defaults startedAt)
- [x] Implement start session request/response DTOs with Zod validation
- [x] Implement start session controller (POST /workout-sessions)
- [x] Implement PauseWorkoutSessionUseCase (4 tests)
- [x] Implement pause session controller (PATCH /workout-sessions/:id/pause)
- [x] Implement FinishWorkoutSessionUseCase (4 tests — sets finishedAt)
- [x] Implement finish session controller (PATCH /workout-sessions/:id/finish)
- [x] Implement ListWorkoutSessionsUseCase (5 tests — pagination, status filter)
- [x] Implement list sessions controller (GET /workout-sessions/students/:studentId/workout-sessions)
- [x] Implement GetWorkoutSessionUseCase (4 tests — full tree with executions + sets)
- [x] Implement get session controller (GET /workout-sessions/:id)

### Module: workoutExecution/exerciseExecutions ✅ COMPLETE

- [x] Implement ExerciseExecutionRepository (create, findByIdWithTenant, findMaxOrderBySessionId)
- [x] Implement CreateExerciseExecutionUseCase (6 tests — auto-order, tenant isolation)
- [x] Implement create execution request/response DTOs with Zod validation
- [x] Implement create execution controller (POST /exercise-executions)

### Module: workoutExecution/exerciseSets ✅ COMPLETE

- [x] Implement ExerciseSetRepository (create, findByExecutionId)
- [x] Implement RecordExerciseSetUseCase (6 tests — tenant isolation via join chain, weight conversion)
- [x] Implement record set request/response DTOs with Zod validation
- [x] Implement record set controller (POST /exercise-sets)

### Module: progress/records ✅ COMPLETE

- [x] Implement ProgressRecordRepository (create, findAllByStudentId, findById, update, delete)
- [x] Implement CreateProgressRecordUseCase (6 tests — happy path, student not found, wrong tenant, validation, notes)
- [x] Implement create progress record request/response DTOs with Zod validation
- [x] Implement create progress record controller (POST /students/:studentId/progress-records)
- [x] Implement ListProgressRecordsUseCase (6 tests — pagination, metricType filter, empty, defaults, student not found)
- [x] Implement list progress records controller (GET /students/:studentId/progress-records)
- [x] Implement UpdateProgressRecordUseCase (5 tests — happy path, not found, wrong tenant, partial, value conversion)
- [x] Implement update progress record controller (PUT /progress-records/:id)
- [x] Implement DeleteProgressRecordUseCase (4 tests — happy path, not found, wrong tenant, no double delete)
- [x] Implement delete progress record controller (DELETE /progress-records/:id)

### Module: progress/photos ✅ COMPLETE

- [x] Implement ProgressPhotoRepository (create, findAllByStudentId, findById, delete)
- [x] Implement RequestPhotoUploadUseCase (6 tests — happy path, student not found, wrong tenant, invalid MIME, S3 key format, webp support)
- [x] Implement request photo upload controller (POST /students/:studentId/progress-photos/upload-url)
- [x] Implement SaveProgressPhotoUseCase (5 tests — happy path, student not found, wrong tenant, invalid URL, notes)
- [x] Implement save progress photo controller (POST /students/:studentId/progress-photos)
- [x] Implement ListProgressPhotosUseCase (6 tests — pagination, empty, student not found, defaults, custom pagination, tenant isolation)
- [x] Implement list progress photos controller (GET /students/:studentId/progress-photos)

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
