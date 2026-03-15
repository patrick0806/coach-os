---
name: create-schema
description: Generates new Drizzle schemas (entities) and database migrations. Use when adding a new table or modifying the database structure.
---

You are creating or updating a database schema in Coach OS. Follow the steps below strictly.

## Step 1 — Create Entity File

- Create a new file for the entity under the appropriate module: `backend/config/database/schema/{module}/{entity}.ts`.
- Follow the Drizzle ORM pattern for table definitions.

Example:
```ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from '../../platform/entities/tenants';

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenantId')
    .notNull()
    .references(() => tenants.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Step 2 — Export from index.ts

- Every entity's `schema/` folder must have an `index.ts` file.
- Export the new entity from this file: `export * from './{entity}';`.

## Step 3 — Generate Migration

- After defining the schema and exporting it, run the migration generation command from the backend directory:
  `npm run db:generate`
- This will create a new SQL file in the migrations folder.

## Step 4 — Apply Migration (Optional/Development)

- In development, you may need to apply the migration to your local database:
  `npm run db:migrate`

## Mandatory Rules

- [ ] **Multi-Tenancy**: The `tenantId` column is present and correctly referenced.
- [ ] **Naming**: Use `snake_case` for database columns and `camelCase` for TypeScript property names if they differ (using the second argument in Drizzle columns if needed).
- [ ] **Timestamps**: Always include `createdAt` and `updatedAt`.
- [ ] **Exports**: The entity is exported in the module's `entities/index.ts`.
- [ ] **Validation**: Ensure any associated DTOs (using `drizzle-zod` or manual Zod) are updated to match the new schema.
