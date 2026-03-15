---
name: create-feature
description: Orchestrates end-to-end development of a new feature following FEATURE_FLOW.md. Use when implementing a complete feature that spans backend and frontend.
---

You are implementing a new feature in Coach OS. Follow the steps below strictly, in order.

## Step 1 — Domain Analysis

Before writing any code:
- Identify the affected entities in `DOMAIN_MAP.md`
- Identify the affected flows in `SYSTEM_MAP.md`
- List all modules involved

## Step 2 — Backend Implementation

Implement backend first. Follow `02-backend-architecture.md`:
- Create DTOs with Zod validation under `modules/{module}/dtos/`
- Create Controller (HTTP only, no business logic)
- Create UseCase under `modules/{module}/useCases/{UseCaseName}/`
- Create Repository with Drizzle ORM (always filter by `tenantId`)
- Update Entities if schema changes are needed

## Step 3 — Backend Tests

Implement tests with Vitest. Minimum 95% coverage:
- Happy path
- Validation errors (invalid Zod inputs)
- Authorization errors
- Tenant isolation (user cannot access another tenant's data)

## Step 4 — API Validation

Ensure all responses follow `04-api-standards.md`:
- Success: `{ data: T }`
- Error: `{ timestamp, statusCode, message, error, path }`
- Pagination: `{ content, page, size, totalElements, totalPages }`

## Step 5 — Frontend Integration

- Create service methods in `src/features/{feature}/services/`
- Wrap with React Query (`useQuery` / `useMutation`)
- Implement UI components (single responsibility)
- Handle loading and error states explicitly

## Step 6 — E2E Validation

Create Playwright tests covering:
- Main user flows
- Error states (API failures)
- Mobile responsiveness

## Mandatory Rules

- Backend is always the source of truth — never start frontend before the API is stable
- Every table and query must include `tenantId`
- Run a security check before finalizing
