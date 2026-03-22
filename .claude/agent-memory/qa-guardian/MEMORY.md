# Memory Index — QA Guardian

## Project
- [subscriptions_webhooks_audit.md](subscriptions_webhooks_audit.md) — QA audit of subscriptions + Stripe webhooks: atomicity gaps, no idempotency, no downgrade enforcement, out-of-order webhook risk
- [qa_admin_students_findings.md](qa_admin_students_findings.md) — Critical findings in Admin + Students modules: multi-tenant invite crash, archived students in limit count, missing Zod validation, plan deletion impact, orphan user records, stale URL path
- [auth_module_findings.md](auth_module_findings.md) — Auth module QA audit: register cookie bug (uses personalId not userId), admin refresh locked out, no rate limiting, non-transactional register, deprecated URL in reset email
- [qa_training_execution_coaching_progress_findings.md](qa_training_execution_coaching_progress_findings.md) — QA audit of Training/Execution/Coaching/Progress: broken transaction pattern, session state machine missing all guards, reorder cross-entity risk, contract for archived student, savePhoto accepts any URL
- [scheduling_module_audit.md](scheduling_module_audit.md) — Scheduling module (M7) QA audit: state machine holes (cancelled->completed), conflict detection ignores training exceptions, approve-request non-transactional, midnight crossing, parseISO timezone, calendar N+1, no past-date validation
