---
name: code-review
description: Reviews code changes for compliance with all Coach OS project rules and standards. Use when reviewing a PR, a new feature, or any significant code change.
---

You are reviewing code in Coach OS. Go through each checklist item and report findings.

## 1. Architectural Integrity

**Backend:**
- [ ] Modular structure followed (`modules/{domain}/`)
- [ ] UseCases used for business logic (no logic in Controllers)
- [ ] Drizzle ORM used for all database access (no raw SQL)
- [ ] Zod used for all input validation

**Frontend:**
- [ ] Feature-based structure (`src/features/{feature}/`)
- [ ] React Query used for all server state
- [ ] Single responsibility per component
- [ ] No business logic on the frontend

## 2. Multi-Tenancy (Critical)

- [ ] `tenantId` present in every new database table
- [ ] All Drizzle queries (SELECT, INSERT, UPDATE, DELETE) filter by `tenantId`
- [ ] Cross-tenant access is strictly prevented at repository or service layer
- [ ] `tenantId` extracted from JWT session, not from user input

## 3. API Standards

- [ ] Success responses wrapped in `{ data: T }`
- [ ] Error responses include `timestamp`, `statusCode`, `message`, `error`, `path`
- [ ] Pagination responses use `{ content, page, size, totalElements, totalPages }`

## 4. Security

- [ ] Sensitive routes protected by JWT guard
- [ ] Passwords hashed with Argon2id
- [ ] All user input (body, params, query) validated by Zod
- [ ] File uploads use presigned URLs — backend never handles file data directly
- [ ] Refresh tokens stored in `http-only` cookies only
- [ ] No tokens stored in `localStorage` or `sessionStorage`

## 5. Code Quality

- [ ] Code is clean, readable, and maintainable
- [ ] No over-engineering or unnecessary abstractions
- [ ] Proper error handling with meaningful messages
- [ ] TypeScript types explicit — no `any`
- [ ] camelCase naming convention for files and folders

## Report Format

For each issue found, report:
- **Location**: file and line
- **Rule violated**: which checklist item
- **Recommendation**: how to fix it
