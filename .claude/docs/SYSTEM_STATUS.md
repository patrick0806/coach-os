# SYSTEM_STATUS.md — Coach OS

Last updated: 2026-03-15

---

## Completed

### Database Schema (Drizzle ORM)
- **Status**: Done
- **Date**: 2026-03-15
- All domain entities defined as Drizzle schemas
- 27 tables created across 12 schema files
- Relations defined for all entities
- Migration generated successfully (`0000_mushy_black_bolt.sql`)
- Reset script updated with all new tables

**Schema files:**
- `plans.ts` — SaaS plans (global)
- `users.ts` — Authentication (global)
- `admins.ts` — Platform admins (global)
- `personals.ts` — Coach/Tenant with subscription
- `passwordTokens.ts` — Password setup + reset tokens (global)
- `students.ts` — Students (tenant-scoped)
- `exercises.ts` — Exercise library (nullable tenantId)
- `coaching.ts` — Coach-student relations, service plans, contracts, notes
- `training.ts` — Program templates, workout templates, exercise templates, student programs, workout days, student exercises
- `workoutExecution.ts` — Workout sessions, exercise executions, exercise sets
- `progress.ts` — Progress records, progress photos
- `scheduling.ts` — Availability rules/exceptions, appointment requests, appointments

---

## In Progress

(none)

---

## Pending

- Run `npm run db:migrate` to apply migration to database
- Seed data script
- Module implementations (controllers, use cases, repositories)
