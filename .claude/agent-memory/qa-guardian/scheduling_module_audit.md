---
name: scheduling_module_audit
description: QA audit of Scheduling module (M7): conflict detection gaps, state machine holes, calendar N+1, student cancel uses personalId, approve-request non-transactional, midnight/DST edge cases untested
type: project
---

## Scheduling Module (M7) — QA Audit Findings (2026-03-21)

### Critical
- **cancelAppointment allows completing cancelled appointments**: completeAppointment only checks `status === "completed"`, not `status === "cancelled"`. A cancelled appointment can be marked completed.
- **cancelAppointment controller uses `user.personalId!` for STUDENT role**: Students have `@Roles(PERSONAL, STUDENT)` on cancel, but controller passes `user.personalId!` as tenantId. For students, personalId is the coach's ID (tenant), so this works — but the non-null assertion is fragile.
- **approveRequest is non-transactional**: Updates request status to "approved" then creates appointment in separate DB calls. If appointment creation fails, request stays "approved" with no appointment.

### High
- **Conflict detection ignores cancelled/completed appointments in query but NOT via status filter in detectConflicts**: The `findOverlapping` repository filters `status = "scheduled"`, so cancelled appointments are excluded. OK.
- **Conflict detection does not account for training schedule exceptions**: When checking conflicts for appointments, it loads all active training schedules but does NOT consider exceptions (skip/reschedule). A skipped training slot would still show as a conflict.
- **Calendar has N+1 query for student names**: Iterates over each unique studentId and calls `findById` sequentially.
- **Calendar hardcodes size: 1000 for appointments**: Could miss events for very active coaches.

### Medium
- **Midnight-crossing appointments break conflict detection**: If appointment spans midnight (endAt next day), the time string comparison `startTime < apptEnd && endTime > apptStart` breaks because endTime (e.g., "01:00") < startTime (e.g., "23:00").
- **parseISO without UTC suffix in rescheduleOccurrence**: `parseISO("2026-03-23")` returns local-timezone Date, but `.getUTCDay()` is used. Could cause dayOfWeek mismatch depending on server timezone.
- **No past-date validation on createAppointment**: Coach can create appointments in the past.
- **createSchedule has no conflict detection**: A training schedule can be created overlapping with existing appointments or other schedules.

### Test Gaps
- No test for completing a cancelled appointment (should fail but currently succeeds)
- No test for midnight-crossing time slots in conflict detection
- No test for approveRequest failure mid-transaction
- No test for reschedule to same date as originalDate
- No test for deactivated training schedule still showing in conflict detection
- No test for calendar with 1000+ appointments
