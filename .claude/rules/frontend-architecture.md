# Frontend Architecture Rules - Coach OS

This rule defines the structure and development standards for the frontend application.

## Structure (`src/`)

Organized into **features/** (e.g., `auth/`, `training/`, `scheduling/`, `students/`, `coaching/`). Each feature folder must contain:

- **Components**: Component logic and styles.
- **Hooks**: Feature-specific custom hooks.
- **Services**: API interaction logic for the feature.
- **Types**: Type definitions and interfaces.

## Rules

- **Single Responsibility**: Each component must have a single, clear responsibility. Avoid large, monolithic components.
- **State Management**: Use **React Query** for server state.
- **API Isolation**: All API communication must be abstracted within service layers.
- **Shared Directory**: Shared components, UI elements, and hooks go under `shared/`.
- **Styling**: Use **Tailwind CSS** for styling and **shadcn/ui** for components. Use theme colors avoid using hardcoded colors.
- **Forms**: Use **React Hook Form** for forms and **Zod** for validation.
