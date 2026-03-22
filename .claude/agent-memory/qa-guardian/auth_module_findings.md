---
name: auth_module_findings
description: Critical bugs and vulnerability patterns found in the Auth module (login, register, refreshToken, changePassword, resetPassword, setupPassword)
type: project
---

Auth module QA audit completed 2026-03-21. Key findings:

**Confirmed Bugs:**
1. Register controller uses `personal.id` in refresh cookie instead of `user.id` (register.controller.ts:31). Breaks refresh after registration -- every new coach gets locked out after 15min.
2. RefreshToken useCase does not handle ADMIN role (refreshToken.useCase.ts:123). Admin locked out after access token expires.
3. Password reset email URL uses migrated `/personais/` route instead of `/coach/` (requestPasswordReset.useCase.ts:48).

**Architectural Gaps:**
- No rate limiting on ANY endpoint (no ThrottlerModule). Login, register, password-reset all exposed to brute force.
- Register flow is NOT transactional: user created before Stripe calls. If Stripe fails, orphan user blocks re-registration with same email.
- No logging/observability in auth flows -- failed logins, token reuse, password resets are silent.
- JWT strategy validate() does zero post-issuance checks -- deactivated users keep access for up to 15min.

**Why:** These are the most revenue-impactful and security-critical findings. The register cookie bug affects 100% of new registrations.

**How to apply:** When reviewing auth-related PRs, verify: (1) cookie format consistency, (2) all roles handled in switch/if chains, (3) transactional boundaries for multi-step operations, (4) URL formats match current routing.
