---
name: QA findings - Admin and Students modules
description: Critical vulnerability patterns found in Admin and Students modules during deep QA analysis (2026-03-21)
type: project
---

Key findings from Admin + Students module QA analysis:

1. **acceptInvite cannot handle multi-tenant students**: users.email has unique index, so a student invited to tenant B who already accepted invite from tenant A will get a raw DB constraint error (no graceful handling). The use case calls usersRepository.create() without checking if user already exists.

2. **countByTenantId counts archived students**: Student limit enforcement uses countByTenantId which counts ALL students (active + paused + archived). A coach who archives 10 students and tries to add new ones will be blocked even though they have 0 active students.

3. **sendStudentAccess DTO lacks Zod validation**: The `mode` parameter is typed via TypeScript class but has NO runtime validation (no global ValidationPipe, no Zod in use case). Any string value for `mode` will be accepted.

4. **deletePlan has no active-subscription check**: Admin can soft-delete a plan that coaches are currently subscribed to. Since findById filters by isActive=true, subsequent student limit checks will fail with NotFoundException("Plan not found") for those coaches.

5. **deleteAdmin leaves orphan user record**: Only deletes admin profile, leaves users table entry with role=ADMIN intact. Orphaned user can still authenticate.

6. **No race condition protection on invite flows**: inviteStudent and generateInviteLink have TOCTOU gap between countByTenantId check and token/student creation. Two concurrent invites could both pass the limit check.

7. **sendStudentAccess uses old /personais/ URL path**: The access link uses `/personais/${slug}/configurar-senha` but routes were migrated to `/coach/${slug}/` in Sprint 3.

**Why:** These are revenue-impacting (plan deletion, student limits) and data-integrity (multi-tenant student, orphan records) issues.

**How to apply:** When reviewing any student/admin feature changes, verify: limit counting logic, token lifecycle, plan references, and user record cleanup.
