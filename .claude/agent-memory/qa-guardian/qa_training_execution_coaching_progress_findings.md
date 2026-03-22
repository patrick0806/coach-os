---
name: qa_training_execution_coaching_progress_findings
description: QA audit of Training (M8), Workout Execution (M9), Coaching (M10), Progress (M11) modules — session state machine missing guards, reorder cross-tenant risk, no concurrent session prevention, contract for archived student, savePhoto accepts any URL
type: project
---

## M8 Training
- assignProgram: transaction uses `_tx` (unused) — all repo calls go to outer connection, not transactional
- duplicateProgramTemplate: same `_tx` ignored pattern — partial duplicate possible on failure
- reorder: atomicity OK (repository uses tx), BUT no validation that item IDs actually belong to the parent programTemplate/workoutTemplate — cross-entity reorder possible
- updateStudentProgramStatus: no guard against finished->active reverse transition — any status can go to any status
- No test for assigning program to archived/paused student

## M9 Workout Execution
- NO session state guards: finish/pause don't check current status — can finish an already-finished session, pause a finished session
- NO concurrent session prevention — student can start unlimited parallel sessions for same workoutDay
- createExecution: no check that session.status is "started" — can add executions to finished sessions
- recordSet: no check that parent session is started — can record sets on finished sessions
- startSession: no validation that workoutDay belongs to the student's program — only checks tenantId
- createExecution: no validation that studentExerciseId belongs to the session's workoutDay

## M10 Coaching
- createContract: no check for student.status — allows contract for archived student
- deleteServicePlan: hard delete — orphans existing contracts that reference the plan (FK violation or dangling reference)
- cancelContract + createContract: no transaction — race condition on auto-cancel existing + create new
- No test for creating contract when student is archived/paused

## M11 Progress
- savePhoto: accepts any URL — no validation that URL matches the presigned URL pattern (tenant/student path)
- getMyChartData controller: uses `user.personalId!` as tenantId — correct for student tenant scoping
- requestMyPhotoUpload: correctly uses profileId as studentId and personalId as tenantId
- createCheckin: records array accepts any metricType string (no enum validation) — inconsistent with chart endpoint which validates against enum

**How to apply:** These findings cover the most impactful gaps. Priority: session state machine (M9), transaction integrity (M8/M10), status transition guards (M8).
