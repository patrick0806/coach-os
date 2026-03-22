---
name: Security Audit M2/M3/M6
description: Deep security findings for Subscriptions (M3), Admin (M2), and Students (M6) modules — March 2026
type: project
---

## Key Security Patterns Found

**GOOD:**
- All admin controllers have `@Roles(ApplicationRoles.ADMIN)` — no bypass possible
- Stripe webhook verifies signature via `constructEvent()` — cannot be spoofed
- Invitation tokens stored as SHA-256 hash, raw never persisted
- Refresh token uses `timingSafeEqual` for comparison
- `acceptInvite` is `@Public()` but validates token hash before any mutation
- `countByTenantId` filters by tenantId — no cross-tenant count leak
- `findById` in students repo requires tenantId — IDOR protected

**CRITICAL/HIGH ISSUES:**
- SEC-M3-001: `changePlan` updates Stripe BEFORE DB — atomicity violation (line 55-58 then 62-64 in changePlan.useCase.ts)
- SEC-M3-002: `changePlan` has NO student limit validation on downgrade
- SEC-M3-003: `createCheckoutSession` returns `session.url!` — non-null assertion can crash
- SEC-M6-001: `acceptInvite` creates user+student+relation in 4 separate DB calls with no transaction — partial failure leaves orphans
- SEC-M6-002: `countByTenantId` counts ALL students including archived — inflates limit check
- SEC-M6-003: TOCTOU race on student limit check in all 4 endpoints (create, invite, generateLink, acceptInvite)
- SEC-M6-004: `acceptInvite` will 500 if student invited to 2 tenants (unique constraint on users.email)
- SEC-M2-001: `deletePlan` soft-deletes plan, but `findById` filters `isActive=true` — coaches on deleted plan get 404 on plan lookup
- SEC-M2-002: `deleteAdmin` removes admins row but NOT users row — orphan user retains ADMIN role and valid password
- SEC-M6-005: `sendStudentAccess` DTO has no Zod validation on `mode` — accepts any string at runtime

**Why:** QA findings confirmed + additional vectors discovered during code review.
**How to apply:** These need fixes before any public launch. Priority: atomicity violations and TOCTOU races.
