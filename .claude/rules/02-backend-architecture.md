# Backend Architecture Rules - Coach OS

This rule defines the structure and responsibilities of the backend modules.

## Modular Architecture

The backend must follow a modular architecture. Modules are organized under `modules/` (e.g., `platform/`, `training/`, `scheduling/`, `coaching/`, `auth/`).

Each module must strictly contain:

- **Controllers**: Responsible for handling HTTP requests. Must **not** contain business logic.
- **useCases**: Contain business rules and orchestrate repositories. Each use case must be independent and testable. like a service in Clean Architecture. (eg. CreateStudentUseCase, UpdateStudentUseCase, DeleteStudentUseCase they are a folder with de use case and the unit testss for it) 
- **Repositories**: Handle database access. Must use **Drizzle ORM**.
- **DTOs**: Define request and response contracts. Must be validated using **Zod**.
- **Entities**: Define the database structure for the ORM.