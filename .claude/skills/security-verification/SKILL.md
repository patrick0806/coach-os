---
name: security-verification
description: Verifies security compliance of code changes. Use before finalizing any feature, especially routes that handle authentication, sensitive data, file uploads, or cross-tenant operations.
---

You are performing a security verification for Coach OS. Review each section and report any violations.

## 1. Authentication

- [ ] All sensitive routes are protected by a JWT guard
- [ ] `tenantId` is extracted exclusively from the validated JWT session — never from request body or query params
- [ ] Refresh tokens are stored in `http-only` cookies only
- [ ] Access tokens are not stored in `localStorage` or `sessionStorage`

## 2. Multi-Tenancy — Data Isolation (Primary Check)

- [ ] Every `SELECT` query filters by `tenantId`
- [ ] Every `INSERT` includes `tenantId` from session
- [ ] Every `UPDATE` filters by `tenantId` to prevent cross-tenant modifications
- [ ] Every `DELETE` filters by `tenantId` to prevent cross-tenant deletions
- [ ] No query path exists that could return data from a different tenant

## 3. Password Handling

- [ ] All password hashing uses **Argon2id**
- [ ] Plain-text passwords are never logged or stored
- [ ] Salt is managed by the Argon2 library (not manually)

## 4. Input Validation & Sanitization

- [ ] All request body fields validated with **Zod**
- [ ] All route parameters validated with **Zod**
- [ ] All query string parameters validated with **Zod**
- [ ] No raw SQL strings — use Drizzle ORM query builders exclusively
- [ ] Input sanitized before being used in database operations

## 5. Media Uploads

- [ ] Backend never receives or processes file content directly
- [ ] Upload flow is: Frontend requests presigned URL → Backend generates it → Frontend uploads to S3 → Frontend sends URL back to Backend
- [ ] Presigned URLs have a short expiration time and limited scope

## Report Format

For each violation found, report:
- **Severity**: Critical / High / Medium / Low
- **Location**: file and line number
- **Issue**: what the problem is
- **Fix**: how to remediate it
