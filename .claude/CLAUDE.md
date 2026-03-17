# CLAUDE.md --- Coach OS


## Required AI Context

The following documents define the system architecture and rules.
Always consult them before implementing or modifying features.

Core documentation:

- @SYSTEM_MAP.md → System architecture and flows
- @DOMAIN_MAP.md → Core domain model
- @FEATURE_FLOW.md → Step-by-step feature implementation flow

------------------------------------------------------------------------
# AI IMPLEMENTATION PROCESS

Before implementing any feature, AI agents must follow this process:

1. Identify the domain entities involved (@DOMAIN_MAP.md)
2. Identify the system flow (@SYSTEM_MAP.md)
3. Identify the module responsible
4. Implement backend first
5. Create tests
6. Integrate frontend
7. Validate end-to-end behavior

------------------------------------------------------------------------

# System Overview

Coach OS is a multi-tenant SaaS platform for coaches.

The platform allows professionals to:

-   manage students
-   create training programs
-   manage their professional presence
-   sell coaching services through subscriptions

Each coach operates inside an isolated tenant.

------------------------------------------------------------------------

# System Architecture

The system is composed of two independent applications.

frontend/ → Next.js application responsible for UI and UX

backend/ → NestJS REST API responsible for business logic

Architecture flow:

Frontend (Next.js) ↓ REST API ↓ Backend (NestJS) ↓ PostgreSQL + External
Services

External services:

-   Stripe (billing)
-   AWS S3 (storage by presigned urls)
-   Resend (emails)

------------------------------------------------------------------------

# Architectural Boundaries

Frontend responsibilities:

-   UI rendering
-   user interaction
-   navigation
-   forms
-   client-side validation
-   data fetching

Frontend must never contain business rules.

Backend responsibilities:

-   business rules
-   authentication
-   authorization
-   database persistence
-   integrations with external services

Backend must never implement UI logic.

For create new Files or Folders always use de cammelCase naming convention.

------------------------------------------------------------------------

# Development Strategy

When implementing features affecting both applications:

1.  Update backend API
2.  Implement backend logic
3.  Create backend tests
4.  Update frontend service
5.  Implement frontend UI
6.  Validate with E2E tests

Backend is always the source of truth.

------------------------------------------------------------------------

# Code Quality Rules

-   prefer explicit types
-   avoid `any`
-   use Zod for validation
-   follow existing architecture patterns
-   avoid unnecessary abstractions

------------------------------------------------------------------------

# Security Principles

Backend:

-   argon2id password hashing
-   JWT authentication
-   role based access control
-   server-side validation
-   sanitize user input

Frontend:

-   client-side validation
-   secure session handling
-   never store tokens in localStorage or sessionStorage

------------------------------------------------------------------------

# Communication Rules

Responses → Portuguese

Code comments → English

Commits → English

Use:

-   Conventional Commits
-   Gitmoji

If you need to create a new file or folder always use the cammelCase naming convention.
For the code always use the cammelCase naming convention.

For the business logic questions always check the @prd.md file or ask the user

All planing and documentation about the project must be in the /.claude/docs folder.
Always update the @SYSTEM_MAP.md file when you need to update the system architecture.
Always update the @docs/SYSTEM_STATUS.md when finish a task.
Always update the @docs/TASK_BOARD.md when finish a task.

## For extensions
If a tasks need a new entity or extends the domain, always update the @DOMAIN_MAP.md file.
If need manipulate dates always use the date-fns library.

When build interfaces always use the @interface-design skill.
When build components always use the pattern of @create-react-component skill.
Always follow the system design (UI/UX) rules, themes, colors and patterns, not use hardcoded values.
In the frontend for server components for public routes use fetch() directly, for client components use react-query with axios.
If a new implementation break a test, always update the test if its a side effect fix the bug.
Sempre temos um filtro no frontend que depende do que o usuário digitar use debounce. To avoid unnecessary requests.

------------------------------------------------------------------------

## Frontend Testing Convention

All frontend tests use **Playwright**. There are no unit tests for services — services are validated indirectly via smoke tests against the real backend.

### Two test types per feature

**Behavioral tests** (`*.behavior.spec.ts`)
- Mock all API calls via `page.route()` using static fixtures
- Do NOT require a running backend
- Run on every PR and local development: `npm run test:e2e`
- Cover: list/display, filters, pagination, CRUD flows (dialogs open/close/feedback), empty states, mobile
- Use `injectMockAuth(page)` to inject fake auth cookies — bypasses `/auth/refresh`
- Use stateful mocks (`mockGetStateful`) for mutations that trigger React Query refetch

**Smoke tests** (`*.smoke.spec.ts`)
- Run against the real backend with an isolated coach account per run
- Create a fresh coach via `createIsolatedCoach(request)` — unique UUID email, no data collision between runs
- Run separately (before deploy or on demand): `npm run test:e2e:smoke`
- Cover: critical happy paths only (e.g., register → login, create resource end-to-end)

### Directory structure

```
tests/e2e/
  <feature>/
    <feature>.behavior.spec.ts   ← mocked API, no backend
    <feature>.smoke.spec.ts      ← real backend, isolated coach
  support/
    apiMocks.ts                  ← page.route() helpers + injectMockAuth
    testIsolation.ts             ← createIsolatedCoach + injectCoachSession
  fixtures/
    <feature>.fixtures.ts        ← static JSON fixtures per feature
```

### Key patterns

- `injectMockAuth(page)` — injects `coach_os_at` + `coach_os_user` cookies (fake, no network call)
- `createIsolatedCoach(request)` — registers real coach with `smoke-{uuid}@e2e.test`, returns `{ accessToken, tenantId, ... }`
- `injectCoachSession(page, coach)` — injects real auth cookies for smoke tests
- `mockGet(page, pattern, fixture)` — intercepts GET with static response
- `mockGetStateful(page, pattern, initial, afterMutation)` — first call returns `initial`, subsequent calls return `afterMutation`
- Server-side fetches (Next.js `fetch()` in Server Components) **cannot** be intercepted by `page.route()` — those flows must be covered in smoke tests only

### Run commands

```bash
npm run test:e2e          # behavioral tests only (no backend required)