---
name: create-tests
description: Creates automated tests for backend (Vitest) and frontend (Playwright). Use when adding tests for a new feature, use case, or user flow.
---

You are creating tests for Coach OS. Follow the requirements below for the target layer.

## Backend Tests — Vitest

### Location
- Unit tests: inside the UseCase folder (`modules/{module}/useCases/{UseCaseName}/{UseCaseName}.spec.ts`)
- Integration tests: in an `__tests__/` or `integration/` folder within the module

### Minimum Coverage
- **95%** line and branch coverage is mandatory

### Required Test Cases

**Happy Path**
- Valid inputs produce the expected output
- Database state changes as expected

**Validation Errors**
- Invalid Zod inputs are rejected with correct error messages
- Missing required fields return 400

**Authorization Errors**
- Unauthenticated requests are rejected (401)
- Unauthorized roles are rejected (403)

**Tenant Isolation (Critical)**
- A user from Tenant A cannot read data from Tenant B
- A user from Tenant A cannot modify or delete data from Tenant B
- Queries without a valid `tenantId` must not return results

### Test Structure
```ts
describe('UseCaseName', () => {
  it('should [happy path description]', async () => { ... })
  it('should throw when [validation error]', async () => { ... })
  it('should throw when [auth error]', async () => { ... })
  it('should not expose data from another tenant', async () => { ... })
})
```

---

## Frontend Tests — Playwright

### Location
- `e2e/` or `tests/` folder at the root of the frontend app

### Required Test Cases

**Main Flows**
- Login and Logout
- Core feature flows (students, scheduling, coaching, training)

**Error States**
- UI reacts correctly when the API returns an error
- Loading states are displayed while fetching

**Validation**
- Form validations prevent invalid submissions
- Correct feedback messages shown to the user

**Mobile Behavior**
- Test on common mobile viewports (e.g. 390x844)
- All core interactions work on mobile

---

## Execution Commands

- **Backend**: `npm run test` or `npx vitest`
- **Frontend E2E**: `npx playwright test`
