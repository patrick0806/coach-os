# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-18

---

## Backend Status

| Module | Status | Notes |
|--------|--------|-------|
| **shared** | completed | Guards (JWT, Roles, TenantAccess — 17 tests), filters, interceptors, decorators, providers (Drizzle, Stripe, S3, Resend), repositories (PersonalsRepository, UsersRepository, PlansRepository, PasswordTokensRepository, StudentsRepository, CoachStudentRelationsRepository, StudentInvitationTokensRepository, StudentNotesRepository, ExercisesRepository, ProgramTemplatesRepository, WorkoutTemplatesRepository, ExerciseTemplatesRepository, ProgressRecordsRepository, ProgressPhotosRepository, AvailabilityRulesRepository, AvailabilityExceptionsRepository, TrainingSchedulesRepository, AppointmentsRepository, AppointmentRequestsRepository, **ServicePlansRepository**), utils, enums, exceptions |
| **health** | completed | GET /health endpoint |
| **auth** | completed | Register (15 tests), Login (10 tests), RefreshToken (11 tests), RequestPasswordReset (11 tests), ResetPassword (12 tests), SetupPassword (10 tests). JWT Strategy, argon2id, http-only refresh token cookie, token reuse detection, anti-enumeration password reset, single-use tokens |
| **platform/plans** | completed | GET /plans endpoint (public, 6 tests). Lists active plans with public fields only |
| **students** | completed | POST /students (9 tests), GET /students (6 tests), GET /students/:id (4 tests), PUT /students/:id (5 tests), PATCH /students/:id/status (6 tests), POST /students/invite (7 tests), POST /students/invite-link (6 tests), POST /students/accept-invite (12 tests). Student limit enforcement, invitation flow with Resend email, shareable invite links, tenant isolation |
| **coaching/notes** | completed | POST /students/:studentId/notes (4 tests), GET /students/:studentId/notes (3 tests), PUT /notes/:id (4 tests), DELETE /notes/:id (3 tests). Ordered by createdAt DESC, tenant isolation |
| **coaching/relations** | completed | GET /coach-student-relations (3 tests), PATCH /coach-student-relations/:id/status (5 tests). Archives with endDate, includes student name/email |
| **platform/admins** | not started | Next: admin guard, admin repository |
| **platform/subscriptions** | not started | Backlog: Stripe webhooks, plan changes |
| **platform/tenants** | not started | Backlog: admin tenant management |
| **platform/profile** | completed | GET /profile (3 tests), PUT /profile (5 tests), POST /profile/photo/upload-url (4 tests). Full profile CRUD, S3 presigned URL upload, themeColor hex validation, LP fields |
| **coaching/servicePlans** | completed | POST /service-plans (5 tests), GET /service-plans (3 tests), GET /service-plans/:id (4 tests), PUT /service-plans/:id (5 tests), DELETE /service-plans/:id (3 tests). Full CRUD, attendanceType enum, tenant isolation |
| **public** | completed | GET /public/:slug (4 tests). Public coach profile by slug with active service plans, no auth required (@Public + @BypassTenantAccess) |
| **coaching/contracts** | not started | Backlog: coaching contract management |
| **exercises** | completed | POST /exercises (6 tests), GET /exercises (6 tests), GET /exercises/:id (4 tests), PUT /exercises/:id (6 tests), DELETE /exercises/:id (5 tests), POST /exercises/:id/upload-url (6 tests). Global + private visibility, tenant isolation, S3 presigned URL upload flow |
| **training/programTemplates** | completed | POST /program-templates (5 tests), GET /program-templates (5 tests), GET /program-templates/:id (4 tests), PUT /program-templates/:id (5 tests), DELETE /program-templates/:id (3 tests), POST /program-templates/:id/duplicate (4 tests), POST /program-templates/:id/workouts (5 tests), PATCH /program-templates/:id/workouts/reorder (4 tests). Full tree fetch with workout+exercise data, deep copy on duplicate, auto-order |
| **training/workoutTemplates** | completed | PUT /workout-templates/:id (5 tests), DELETE /workout-templates/:id (3 tests), POST /workout-templates/:id/exercises (6 tests), PATCH /workout-templates/:id/exercises/reorder (4 tests). Exercise visibility check (global or same tenant), auto-order |
| **training/exerciseTemplates** | completed | PUT /exercise-templates/:id (5 tests), DELETE /exercise-templates/:id (3 tests). Tenant isolation via 3-table join chain |
| **training/studentPrograms** | completed | POST /students/:studentId/programs (6 tests), GET /students/:studentId/programs (5 tests), GET /student-programs/:id (5 tests), PATCH /student-programs/:id/status (5 tests). Template snapshot on assign, tenant isolation, pagination |
| **training/workoutDays** | completed | PUT /workout-days/:id (5 tests). Tenant isolation via join chain |
| **training/studentExercises** | completed | PUT /student-exercises/:id (5 tests). Tenant isolation via double join chain |
| **workoutExecution/sessions** | completed | POST /workout-sessions (6 tests), PATCH /workout-sessions/:id/pause (4 tests), PATCH /workout-sessions/:id/finish (4 tests), GET /workout-sessions/students/:studentId/workout-sessions (5 tests), GET /workout-sessions/:id (4 tests). Full tree fetch with executions+sets, tenant isolation |
| **workoutExecution/exerciseExecutions** | completed | POST /exercise-executions (6 tests). Auto-order, tenant isolation via session join |
| **workoutExecution/exerciseSets** | completed | POST /exercise-sets (6 tests). Tenant isolation via double join chain, weight number→string conversion |
| **progress/records** | completed | POST /students/:studentId/progress-records (6 tests), GET /students/:studentId/progress-records (6 tests), PUT /progress-records/:id (5 tests), DELETE /progress-records/:id (4 tests). Paginated with metricType filter, numeric value→string conversion, tenant isolation |
| **progress/photos** | completed | POST /students/:studentId/progress-photos/upload-url (6 tests), POST /students/:studentId/progress-photos (5 tests), GET /students/:studentId/progress-photos (6 tests). S3 presigned URL upload flow, tenant isolation, JPEG/PNG/WebP support |
| **scheduling/availability** | completed | POST /availability-rules (5 tests), GET /availability-rules (3 tests), PUT /availability-rules/:id (5 tests), DELETE /availability-rules/:id (3 tests), POST /availability-exceptions (4 tests), GET /availability-exceptions (3 tests), DELETE /availability-exceptions/:id (3 tests). Overlap detection, time format validation, date range filtering, tenant isolation |
| **scheduling/trainingSchedules** | completed | POST /students/:studentId/training-schedules (6 tests), GET /students/:studentId/training-schedules (4 tests), PUT /training-schedules/:id (5 tests), DELETE /training-schedules/:id (3 tests), DeactivateByProgram (4 tests). Auto-deactivation on program finish/cancel, tenant isolation |
| **scheduling/appointments** | completed | POST /appointments (7 tests), GET /appointments (5 tests), GET /appointments/:id (4 tests), PATCH /appointments/:id/cancel (5 tests), PATCH /appointments/:id/complete (4 tests). Soft conflict detection (availability rules, exceptions, appointments, training schedules), forceCreate override, online/presential validation, tenant isolation |
| **scheduling/appointmentRequests** | completed | POST /appointment-requests (5 tests), GET /appointment-requests (4 tests), PATCH /appointment-requests/:id/approve (6 tests), PATCH /appointment-requests/:id/reject (4 tests). Auto-creates appointment on approve, conflict detection, tenant isolation |
| **scheduling/calendar** | completed | GET /calendar (5 tests). Unified view merging appointments + training schedules (expanded by dayOfWeek) + exceptions, sorted by date/time |
| **scheduling/shared** | completed | conflictDetection.util.ts (8 tests). Pure function detecting 4 conflict types: exception, outside_availability, appointment, training_schedule |

---

## Frontend Status

| Area | Status | Notes |
|------|--------|-------|
| **Project setup** | completed | Next.js initialized with Tailwind, shadcn/ui components, Playwright config |
| **Design system** | completed | lib/utils.ts (cn utility), AppProvider (ThemeProvider dark-first + QueryClient), Inter font, semantic colors (success/warning/info), multi-hue chart palette, framer-motion animation presets |
| **UI components** | completed | button (premium variants), card (glass/premium variants), input, select, dialog, table, calendar, badge, checkbox, combobox, dropdown-menu, popover, separator, skeleton, sonner, textarea, time-select, label, field, input-group, alert-dialog, whatsapp-icon, avatar, progress, tooltip, tabs, sheet |
| **Shared components** | completed | ThemeToggle, StatsCard, EmptyState, PageHeader, LoadingState (page/card/table/list variants) |
| **Marketing components** | completed | Navbar, Footer, FeatureBlock |
| **Home (Landing page)** | completed | Hero section, feature blocks, pricing section with API plans, CTA section |
| **Services** | completed | plans.service.ts (listPlans), auth.service.ts (login, register, requestPasswordReset, resetPassword, logout) |
| **API layer** | completed | axios.ts (instance + auth interceptors + refresh queue), serverFetch.ts (serverFetch + publicServerFetch), authStore.ts (in-memory + cookie sync), authCookies.ts (shared constants), SessionRestorer in AppProvider |
| **Institutional Pages** | not started | Backlog: FAQ, Contact, Terms, Privacy, About |
| **Authentication** | completed | src/proxy.ts (edge guard), features/auth/{types,services,hooks,components} — login, register (multi-step), forgot-password, reset-password pages; dashboard layout guard |
| **Dashboard** | in progress | layout (sidebar placeholder + guard) + placeholder page done; stats/nav backlog |
| **Students** | not started | Backlog: list, create, detail, edit, invite, notes |
| **Exercises** | completed | exercises/page.tsx (grid, filters, pagination), exerciseCard, exerciseGrid, exerciseFilters (debounce), exerciseFormDialog (create/edit + S3 upload), exerciseDetailDialog, deleteExerciseDialog. Service, 5 hooks (useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise, useRequestUploadUrl). Sidebar activated. E2E: exercises.spec.ts |
| **Training templates** | not started | Backlog: list, create, builder, duplicate |
| **Student programs** | not started | Backlog: assign, detail, customize |
| **Workout execution** | not started | Backlog: session page, history |
| **Progress** | not started | Backlog: records, photos, charts |
| **Scheduling** | not started | Backlog: availability, appointments, requests |
| **Coaching services** | not started | Backlog: service plans, contracts |
| **Public page** | not started | Backlog: editor, preview, rendering |
| **Student portal** | not started | Backlog: training, execution, progress, appointments |
| **Notifications** | not started | Backlog: preferences |

---

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **Database schema** | completed | 29 tables across 13 schema files (Drizzle ORM) — updated students, personals, new studentInvitationTokens, trainingSchedules |
| **Migration files** | completed | `0000_mushy_black_bolt.sql` (initial) + `0001_loose_young_avengers.sql` (schema updates) + `0003_lovely_princess_powerful.sql` (training_schedules) |
| **Migration applied** | completed | Both migrations applied successfully |
| **Seed data** | completed | 3 plans (Básico R$29.90/10, Pro R$49.90/30, Elite R$99.90/100) + 26 global exercises |
| **PostgreSQL** | completed | Database configured |
| **Stripe provider** | completed | Provider initialized in shared/providers |
| **AWS S3 provider** | completed | Provider initialized in shared/providers |
| **Resend provider** | completed | Provider initialized in shared/providers |
| **Swagger docs** | completed | API documentation configured |
| **Logger (Pino)** | completed | Structured logging configured |
| **Environment config** | completed | .env configuration |
| **Docker (backend)** | completed | Dockerfile exists |
| **Docker (frontend)** | completed | Dockerfile exists |
| **CI/CD** | not started | No pipeline configured |
| **Monitoring** | not started | Better Stack planned but not integrated |

---

## Database Schema Files

All schemas are defined and migration is generated. Reference:

| File | Tables | Scope |
|------|--------|-------|
| `plans.ts` | plans | global |
| `users.ts` | users | global |
| `admins.ts` | admins | global |
| `personals.ts` | personals | global (tenant = personal) |
| `passwordTokens.ts` | password_setup_tokens, password_reset_tokens | global |
| `studentInvitationTokens.ts` | student_invitation_tokens | tenant-scoped |
| `students.ts` | students | tenant-scoped |
| `exercises.ts` | exercises | nullable tenantId (global + private) |
| `coaching.ts` | coach_student_relations, service_plans, coaching_contracts, student_notes | tenant-scoped |
| `training.ts` | program_templates, workout_templates, exercise_templates, student_programs, workout_days, student_exercises | tenant-scoped |
| `workoutExecution.ts` | workout_sessions, exercise_executions, exercise_sets | tenant-scoped |
| `progress.ts` | progress_records, progress_photos | tenant-scoped |
| `scheduling.ts` | availability_rules, availability_exceptions, appointment_requests, appointments, training_schedules | tenant-scoped |

---

## Current Focus

**Phase 7 — Workout Execution** — COMPLETE

Workout execution sprint complete. 363 tests passing (35 new tests added).

Completed:
- ~~POST /workout-sessions~~ — done (6 tests, validates student + workout day tenant)
- ~~PATCH /workout-sessions/:id/pause~~ — done (4 tests)
- ~~PATCH /workout-sessions/:id/finish~~ — done (4 tests, sets finishedAt)
- ~~GET /workout-sessions/students/:studentId/workout-sessions~~ — done (5 tests, paginated + status filter)
- ~~GET /workout-sessions/:id~~ — done (4 tests, full tree with executions + sets)
- ~~POST /exercise-executions~~ — done (6 tests, auto-order, tenant isolation)
- ~~POST /exercise-sets~~ — done (6 tests, tenant isolation via join chain)

New repositories: WorkoutSessionsRepository, ExerciseExecutionsRepository, ExerciseSetsRepository

---

## Current Focus

**Phase 8 — Progress Tracking** — COMPLETE

Progress tracking sprint complete. 401 tests passing (38 new tests added).

Completed:
- ~~POST /students/:studentId/progress-records~~ — done (6 tests, numeric value→string, tenant isolation)
- ~~GET /students/:studentId/progress-records~~ — done (6 tests, paginated, metricType filter)
- ~~PUT /progress-records/:id~~ — done (5 tests, partial update, not found, wrong tenant)
- ~~DELETE /progress-records/:id~~ — done (4 tests, not found, wrong tenant)
- ~~POST /students/:studentId/progress-photos/upload-url~~ — done (6 tests, S3 presigned URL, JPEG/PNG/WebP)
- ~~POST /students/:studentId/progress-photos~~ — done (5 tests, mediaUrl validation, notes)
- ~~GET /students/:studentId/progress-photos~~ — done (6 tests, paginated, ordered by createdAt DESC)

New repositories: ProgressRecordsRepository, ProgressPhotosRepository

Next sprint: **Phase 9 — Scheduling** (availability, appointments) or frontend implementation

---

## Current Focus

**Phase 9 — Scheduling** — COMPLETE

Scheduling sprint complete. 506 tests passing (105 new tests added).

---

## Current Focus

**Phase 10 — Profile, Service Plans & Public Page** — COMPLETE

542 tests passing (36 new tests added).

Completed:
- ~~platform/profile~~ — GET /profile, PUT /profile (LP fields + branding), POST /profile/photo/upload-url
- ~~coaching/servicePlans~~ — full CRUD (POST, GET list, GET by id, PUT, DELETE)
- ~~public~~ — GET /public/:slug (public coach page with active service plans)

New repository: ServicePlansRepository
PersonalsRepository extended: `updateProfile`, `findBySlug` now returns full `Personal` object

Next sprint: **Frontend implementation**

---

## Next Milestones

### Milestone 1 — Coach can register and log in ✅ COMPLETE
- Auth module complete (register, login, refresh)
- 85 tests passing, zero TypeScript errors
- **Validates:** Phase 1 Foundation

### Milestone 1b — Remaining auth flows
- Password recovery and reset flows
- Migration applied to database
- Plans listing endpoint (GET /plans)

### Milestone 2 — Coach can manage students
- Student CRUD with invitations
- Coach-student relationships
- Student notes
- Student limit enforcement per plan
- **Validates:** Phase 3 Student Management

### Milestone 3 — Coach can build training programs
- Exercise library (global + private)
- Program templates with workouts and exercises
- Assign programs to students with customization
- **Validates:** Phases 4, 5, 6

### Milestone 4 — Students can execute workouts
- Workout session lifecycle (start, record, finish)
- Exercise execution and set recording
- Session history
- **Validates:** Phase 7 Workout Execution

### Milestone 5 — Full coaching workflow
- Progress tracking (metrics + photos)
- Scheduling and appointments
- Service plans and contracts
- **Validates:** Phases 8, 9, 10

### Milestone 6 — Student-facing product
- Student portal (training, execution, progress, appointments)
- Coach public page and branding
- Notifications
- **Validates:** Phases 11, 12, 13
