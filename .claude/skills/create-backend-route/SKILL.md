---
name: create-backend-route
description: Creates a new backend endpoint in a NestJS module. Use when adding a new API route with DTO, Controller, UseCase, and Repository.
---

You are creating a new backend route in Coach OS. Follow the steps below.

## Step 1 — DTO (Data Transfer Object)

- Define request and response schemas using **Zod**
- Place in `modules/{module}/dtos/`
- Export inferred TypeScript types from the Zod schema

## Step 2 — Controller

- Handle HTTP requests only (GET, POST, PUT, PATCH, DELETE)
- Validate input using the DTOs
- Delegate all logic to the UseCase
- Apply guards and decorators for authentication/authorization

## Step 3 — UseCase

- Create a dedicated folder: `modules/{module}/useCases/{UseCaseName}/`
- Implement independent, testable business logic
- Orchestrate repositories
- Throw domain errors with meaningful messages

## Step 4 — Repository

- Implement database access using **Drizzle ORM**
- Every query (SELECT, INSERT, UPDATE, DELETE) must filter by `tenantId`
- No raw SQL — use Drizzle query builders

## Step 5 — Entities

- Update or create schema definitions if the database structure changes

## Mandatory Checks Before Finishing

- [ ] `tenantId` is included in the table and all queries
- [ ] All inputs validated with Zod (body, params, query)
- [ ] Route is protected with JWT guard if it handles sensitive data
- [ ] Response format follows `04-api-standards.md`
- [ ] UseCase has unit tests covering happy path, validation errors, and tenant isolation
