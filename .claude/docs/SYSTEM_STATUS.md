# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-15 (updated)

---

## Backend Status

| Module | Status | Notes |
|--------|--------|-------|
| **shared** | completed | Guards (JWT, Roles, TenantAccess — 17 tests), filters, interceptors, decorators, providers (Drizzle, Stripe, S3, Resend), repositories (PersonalsRepository, UsersRepository, PlansRepository, PasswordTokensRepository), utils, enums, exceptions |
| **health** | completed | GET /health endpoint |
| **auth** | completed | Register (15 tests), Login (10 tests), RefreshToken (11 tests), RequestPasswordReset (11 tests), ResetPassword (12 tests), SetupPassword (10 tests). JWT Strategy, argon2id, http-only refresh token cookie, token reuse detection, anti-enumeration password reset, single-use tokens |
| **platform/plans** | completed | GET /plans endpoint (public, 6 tests). Lists active plans with public fields only |
| **platform/admins** | not started | Next: admin guard, admin repository |
| **platform/subscriptions** | not started | Backlog: Stripe webhooks, plan changes |
| **platform/tenants** | not started | Backlog: admin tenant management |
| **platform/profile** | not started | Backlog: coach profile CRUD |
| **students** | not started | Backlog: CRUD, invitations, status, plan limits |
| **coaching/relations** | not started | Backlog: coach-student relation management |
| **coaching/notes** | not started | Backlog: student notes CRUD |
| **coaching/servicePlans** | not started | Backlog: service plan CRUD |
| **coaching/contracts** | not started | Backlog: coaching contract management |
| **exercises** | not started | Backlog: exercise library, media upload |
| **training/programTemplates** | not started | Backlog: template CRUD, duplicate |
| **training/workoutTemplates** | not started | Backlog: workout template CRUD, reorder |
| **training/exerciseTemplates** | not started | Backlog: exercise template CRUD, reorder |
| **training/studentPrograms** | not started | Backlog: assign program, snapshot logic |
| **training/workoutDays** | not started | Backlog: workout day customization |
| **training/studentExercises** | not started | Backlog: student exercise customization |
| **workoutExecution/sessions** | not started | Backlog: start, pause, finish sessions |
| **workoutExecution/exerciseExecutions** | not started | Backlog: exercise execution tracking |
| **workoutExecution/exerciseSets** | not started | Backlog: set recording |
| **progress/records** | not started | Backlog: body metrics CRUD |
| **progress/photos** | not started | Backlog: presigned URL upload, metadata |
| **scheduling/availability** | not started | Backlog: availability rules CRUD |
| **scheduling/exceptions** | not started | Backlog: availability exceptions CRUD |
| **scheduling/appointmentRequests** | not started | Backlog: request, approve, reject |
| **scheduling/appointments** | not started | Backlog: appointment CRUD, overlap prevention |

---

## Frontend Status

| Area | Status | Notes |
|------|--------|-------|
| **Project setup** | completed | Next.js initialized with Tailwind, shadcn/ui components, Playwright config |
| **UI components** | completed | button, card, input, select, dialog, table, calendar, badge, checkbox, combobox, dropdown-menu, popover, separator, skeleton, sonner, textarea, time-select, label, field, input-group, alert-dialog, whatsapp-icon |
| **Authentication** | not started | Backlog: login, register, password reset, session management |
| **Dashboard** | not started | Backlog: layout, home page |
| **Students** | not started | Backlog: list, create, detail, edit, invite, notes |
| **Exercises** | not started | Backlog: library, create, edit, media upload |
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
| **Database schema** | completed | 28 tables across 13 schema files (Drizzle ORM) — updated students, personals, new studentInvitationTokens |
| **Migration files** | completed | `0000_mushy_black_bolt.sql` (initial) + `0001_loose_young_avengers.sql` (schema updates) |
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
| `scheduling.ts` | availability_rules, availability_exceptions, appointment_requests, appointments | tenant-scoped |

---

## Current Focus

**Phase 1 — Foundation** (Roadmap) — COMPLETE

Phase 1 is done. All auth module endpoints are implemented with 119 tests passing.

Completed:
- ~~Passport JWT Strategy~~ — done
- ~~TenantAccessGuard~~ — done (17 tests passing)
- ~~PersonalsRepository, UsersRepository, PlansRepository, PasswordTokensRepository~~ — done
- ~~Seed data~~ — done (3 plans + 26 global exercises)
- ~~Database migrations~~ — done (0000, 0001, 0002 generated)
- ~~POST /auth/register~~ — done (15 tests)
- ~~POST /auth/login~~ — done (10 tests)
- ~~POST /auth/refresh~~ — done (11 tests)
- ~~POST /auth/password-reset/request~~ — done (11 tests, anti-enumeration)
- ~~POST /auth/password-reset/confirm~~ — done (12 tests)
- ~~POST /auth/password-setup~~ — done (10 tests)
- ~~Apply database migrations (`npm run db:migrate`) ~~ -- done

Next sprint: **Phase 2 — Student Management**
- Plans listing endpoint (GET /plans)
- Student CRUD with plan limit enforcement
- Student invitations (email + link)
- Coach-student relationships
- Student notes

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
