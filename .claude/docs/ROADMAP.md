# ROADMAP.md — Coach OS

---

## Phase 1 — Foundation

Infrastructure, authentication, and multi-tenant isolation.
This phase establishes the core platform that every other feature depends on.

- [x] Project setup (backend + frontend)
- [x] Database schema definition (Drizzle ORM)
- [x] Migration generation
- [ ] Apply database migration
- [ ] Seed data script (plans, global exercises)
- [ ] Passport JWT Strategy (required for all authenticated routes)
- [ ] TenantAccessGuard implementation (required for tenant isolation)
- [ ] PersonalsRepository (base operations for auth and tenant guard)
- [ ] Multi-tenant isolation (tenantId filtering on all queries)
- [ ] Coach registration with plan selection
- [ ] Stripe subscription creation on registration
- [ ] Login (JWT access token + refresh token in http-only cookie)
- [ ] Password recovery and reset (token-based via email)
- [ ] Role-based access control (admin, coach, student)
- [ ] Coach profile setup (onboarding first step)

**Epics:** Authentication & Onboarding, SaaS Plans & Billing

**Delivers:** A coach can register, choose a plan, pay via Stripe, log in, and access an isolated workspace.

---

## Phase 2 — SaaS Management & Administration

Platform administration and subscription lifecycle management.

- [ ] Plan catalog (list available plans: Basic, Pro, Elite)
- [ ] Subscription status management (active, past_due, cancelled)
- [ ] Student limit enforcement per plan
- [ ] Plan upgrades and downgrades
- [ ] Trial period support
- [ ] Admin login
- [ ] Admin tenant management (view, suspend)
- [ ] Admin subscription oversight
- [ ] Admin coach account management
- [ ] Admin global exercise library management

**Epics:** SaaS Plans & Billing, Platform Administration

**Delivers:** Platform operators can manage tenants and billing. Coaches have enforced plan limits.

---

## Phase 3 — Student Management

Student CRUD, invitations, and coach-student relationships.

- [ ] Create student manually
- [ ] Student profiles (name, email, phone, goals, restrictions)
- [ ] Student status management (active, paused, archived)
- [ ] Invite student via email
- [ ] Generate shareable invite link (WhatsApp compatible)
- [ ] Student accepts invitation and creates account
- [ ] Coach-student relationship creation
- [ ] Coach-student relationship history tracking
- [ ] Coach notes per student (create, list, chronological order)

**Epics:** Student Management

**Delivers:** A coach can build and organize a student base with profiles, invitations, and internal notes.

---

## Phase 4 — Exercise Library

Global and private exercise catalog with media support.

> **Plan gating:** Private/custom exercises require **Pro plan or above** (PRD Section 4).

- [ ] List global exercises
- [ ] Create private exercise (coach-scoped)
- [ ] Exercise attributes (name, muscle groups, description, instructions)
- [ ] Media upload for exercises (presigned URL to S3)
- [ ] Visibility rules (private exercises visible only to creator)
- [ ] Search and filter exercises

**Epics:** Exercise Library

**Delivers:** Coaches have access to a rich exercise catalog and can create their own custom exercises.

---

## Phase 5 — Training Program Templates

Reusable program and workout template system.

- [ ] Create program template
- [ ] Edit program template
- [ ] Duplicate program template
- [ ] Add workout template to program
- [ ] Edit workout template (name, order)
- [ ] Add exercise to workout template
- [ ] Configure exercise parameters (sets, reps, rest, duration)
- [ ] Remove exercise from workout template
- [ ] Delete workout template
- [ ] Delete program template

**Epics:** Training Program Templates

**Delivers:** Coaches can design reusable training blueprints with structured workouts and exercises.

---

## Phase 6 — Student Training Programs

Assign templates to students and customize individual programs.

- [ ] Assign program template to student (create independent snapshot)
- [ ] List student programs
- [ ] View student program details (workout days, exercises)
- [ ] Customize student exercise parameters (weight, reps, rest, duration)
- [ ] Organize workout days (Workout A, B, C — name, order)
- [ ] Program status management (active, finished, cancelled)
- [ ] Template independence (template changes do not affect assigned programs)

**Epics:** Student Training Programs

**Delivers:** Each student has a personalized, independently editable training program.

---

## Phase 7 — Workout Execution

Real-time workout tracking and session recording.

- [ ] Start workout session
- [ ] Pause workout session
- [ ] Record exercise execution
- [ ] Record exercise sets (planned reps, performed reps, planned weight, used weight, rest)
- [ ] Mark exercise as completed or skipped
- [ ] Finish workout session
- [ ] Session timing (started at, finished at, total duration)
- [ ] Workout session history per student

**Epics:** Workout Execution

**Delivers:** Students can execute workouts in real time, and coaches can review detailed session data.

---

## Phase 8 — Student Progress Tracking

Body metrics, progress photos, and historical visualization.

> **Plan gating:** Advanced metrics require **Elite plan** (PRD Section 4).

- [ ] Record body metrics (weight, body fat, measurements)
- [ ] List progress records per student (chronological)
- [ ] Upload progress photos (presigned URL to S3)
- [ ] List progress photos (chronological order)
- [ ] Historical data visualization (graphs, timelines)
- [ ] Metric comparison over time

**Epics:** Student Progress Tracking

**Delivers:** Coaches and students can track measurable physical evolution with data and photos.

---

## Phase 9 — Scheduling & Appointments

Availability management, appointment requests, and session scheduling.

- [ ] Define coach availability rules (recurring weekly schedule)
- [ ] Create availability exceptions (vacations, holidays, blocked dates)
- [ ] List available time slots
- [ ] Student appointment request
- [ ] Coach appointment approval
- [ ] Coach manual appointment creation
- [ ] Appointment types (online with meeting URL, in-person with location)
- [ ] Cancel appointment (coach or student)
- [ ] Reschedule appointment
- [ ] Overlap prevention for coaches

**Epics:** Scheduling & Appointments

**Delivers:** Coaches and students can coordinate sessions without manual back-and-forth.

---

## Phase 10 — Coaching Services & Contracts

Service plans and formal coach-student agreements.

- [ ] Create service plan (attendance type, sessions per week, price)
- [ ] List and edit service plans
- [ ] Create coaching contract (coach, student, service plan, dates)
- [ ] Contract status management (active, expired, cancelled)
- [ ] Active service tracking and limits
- [ ] Online and in-person service type support

**Epics:** Coaching Services & Contracts

**Delivers:** Coaches can formalize service offerings and manage structured client agreements.

---

## Phase 11 — Student Portal

Dedicated student-facing experience.

- [ ] Student login
- [ ] View current training program and exercises
- [ ] Execute workouts and record loads
- [ ] View workout history
- [ ] View progress history and graphs
- [ ] View scheduled appointments
- [ ] Request appointments

**Epics:** Student Portal

**Delivers:** Students have autonomous access to their training, progress, and schedule.

---

## Phase 12 — Coach Public Page & Branding

Public profile and white-label customization.

> **Plan gating:** Public page and branding customization require **Pro plan or above** (PRD Section 4).

- [ ] Coach public profile page (photo, bio, specialties)
- [ ] Custom URL per coach (app.com/personal/slug)
- [ ] WhatsApp contact button
- [ ] Logo upload and primary color customization
- [ ] Branding applied to student portal
- [ ] Branding applied to public pages

**Epics:** Coach Public Page & Branding

**Delivers:** Coaches can attract new clients through a professional, branded online presence.

---

## Phase 13 — Notifications

Automated communication for engagement and retention.

- [ ] Workout reminders (email)
- [ ] Session reminders (email)
- [ ] Missed workout alerts (email)
- [ ] Notification preferences

**Epics:** Notifications

**Delivers:** Automated nudges reduce no-shows and improve training consistency.

---

# Phase Dependency Map

```
Phase 1  Foundation
  ↓
Phase 2  SaaS Management
  ↓
Phase 3  Student Management
  ↓
Phase 4  Exercise Library ──────────────────┐
  ↓                                         │
Phase 5  Training Templates ←───────────────┘
  ↓
Phase 6  Student Programs
  ↓
Phase 7  Workout Execution
  ↓
Phase 8  Progress Tracking
  ↓
Phase 9  Scheduling ─────────┐
  ↓                          │
Phase 10 Services & Contracts│
  ↓                          │
Phase 11 Student Portal ←────┘
  ↓
Phase 12 Branding
  ↓
Phase 13 Notifications
```
