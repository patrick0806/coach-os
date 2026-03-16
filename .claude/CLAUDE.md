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
