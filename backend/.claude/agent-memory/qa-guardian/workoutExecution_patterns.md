---
name: workoutExecution_patterns
description: QA findings for workout execution module — race conditions, non-null assertions, DTO gaps
type: project
---

Workout execution module has recurring patterns worth tracking:

1. **Race condition on session creation**: findActiveByStudentAndWorkoutDay + create has no DB-level uniqueness constraint. Two concurrent requests can create duplicate active sessions for same studentId+workoutDayId. Needs unique partial index.

2. **Non-null assertion in startSession.useCase.ts:58**: `findByIdWithExecutions` result used with `!` — if session is deleted between queries, returns undefined as valid response. Needs null guard.

3. **Response DTOs lag behind use case changes**: StartWorkoutSessionResponseDTO doesn't include exerciseExecutions added in idempotent feature. Swagger docs incomplete.

4. **CHK-026/CHK-027 still open**: createExecution and recordSet don't check session status — can add data to finished sessions.

**Why:** These are systemic patterns in the workoutExecution module that compound. The race condition + missing status checks mean data integrity is at risk under concurrent usage.

**How to apply:** When reviewing any workoutExecution changes, always check (a) race conditions on state transitions, (b) non-null assertions after multi-query operations, (c) DTO sync with use case return types.
