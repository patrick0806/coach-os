# FEATURE_FLOW.md — Coach OS

This document describes how new features must be implemented in the system.

AI agents must follow this process when implementing functionality.

---

# Feature Development Workflow

Every feature must follow this order:

1. Domain analysis
2. Backend implementation
3. Backend tests
4. API validation
5. Frontend integration
6. E2E validation

Backend is always the source of truth.

---

# Step 1 — Domain Analysis

Before writing code:

- identify affected entities in DOMAIN_MAP.md
- identify affected flows in SYSTEM_MAP.md

Example:

Feature: "Student booking appointment"

Entities involved:

- Student
- Coach
- Appointment
- Availability

---

# Step 2 — Backend Implementation

Implement backend first.

Required steps:

1. Create DTOs
2. Create controller route
3. Create service logic
4. Create repository operations
5. Validate tenant isolation

Example:

POST /appointments

Request DTO:

{
  studentId: string
  coachId: string
  date: Date
}

---

# Step 3 — Backend Tests

Required tests:

- happy path
- validation errors
- authorization errors
- tenant isolation

---

# Step 4 — API Validation

Ensure response formats follow API rules.

Example success:

{
  id: string
  date: Date
  status: "scheduled"
}

---

# Step 5 — Frontend Integration

Frontend must:

1. create service method
2. integrate with React Query
3. implement UI
4. handle loading and error states

---

# Step 6 — E2E Validation

Use Playwright.

Validate:

- booking appointment
- cancel appointment
- mobile behavior