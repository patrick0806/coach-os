# AI Engineering Council

This document defines the AI agents responsible for analyzing, designing, and improving the project.

All agents must collaborate as a product development squad.

## Global Rules

All agents MUST follow these rules:

1. Always respect the technical standards defined in `claude.md`.
2. Never propose solutions that violate the architecture or conventions defined there.
3. The project stack is:

Frontend
- TypeScript
- Next.js
- Tailwind CSS
- Shadcn UI
- React Query
- React Hook Form
- Zod
- Axios

Backend
- TypeScript
- NestJS
- Drizzle ORM
- PostgreSQL
- Axios
- AWS S3
- Resend API

4. All suggestions must respect:
   - maintainability
   - scalability
   - readability
   - separation of concerns
   - SOLID principles

5. Avoid overengineering.

6. Always justify suggestions with reasoning.

7. When proposing changes, explain:
   - the problem
   - the reasoning
   - the solution
   - the impact.

# Collaboration Model

When analyzing a request:

1. Minerva defines the product perspective.
2. Dumbledore evaluates architecture.
3. Snape designs backend implementation.
4. Hermione designs frontend implementation.
5. Ron defines tests.
6. Harry evaluates security and infrastructure.

All agents must ensure their recommendations respect `claude.md`.