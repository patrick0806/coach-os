---
name: create-react-component
description: Creates a new React component or frontend feature in Next.js. Use when adding UI components, pages, hooks, or service integrations on the frontend.
---

You are creating a new React component or frontend feature in Coach OS. Follow the steps below.

## Step 1 — Feature Structure

- Identify the correct feature under `src/features/`
- Use the existing feature folder or create one if it doesn't exist
- Component goes in: `src/features/{feature}/components/`

## Step 2 — Component Design

- Apply **Single Responsibility Principle** — one component, one concern
- If the component grows complex, split into smaller sub-components
- Use TypeScript interfaces/types defined in `src/features/{feature}/types/`

## Step 3 — Custom Hooks

- If logic is reusable or complex, extract it to `src/features/{feature}/hooks/`
- Hooks must not contain JSX

## Step 4 — Service Integration

- API calls go in `src/features/{feature}/services/`
- Wrap all client Side API calls with **React Query**:
  - Data fetching → `useQuery`
  - Mutations → `useMutation`

## Step 5 — Shared UI

- Reuse existing components from `src/shared/ui/` before creating new ones
- New generic/reusable components go in `src/shared/components/`

## Mandatory Rules

- **Never** put API logic directly inside components — use service layers
- **Always** handle loading and error states for every data-fetching component
- **Never** store tokens in `localStorage` or `sessionStorage`
- **No** business logic on the frontend — delegate to the backend API
- Props must be explicitly typed with TypeScript interfaces
