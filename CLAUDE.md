# CLAUDE.md - Coach OS

## Project Over View 
This project is a platform for coaches to manage their clients and programs. It is a SaaS application that allows coaches to create and manage their clients, programs, and help the coach with their marketing and professional presence on the web. Each professional will have their own professional website(Landing Page) and will be able to manage their clients and programs through the platform.

The SaaS will be paid monthly and will have different tiers based on the number of clients and programs the coach wants to manage. And need to be a White Label Solution. Using the tenant ID to separate the data of each professional.

## Stack
- **Frontend:** Next.js, TailwindCSS, shadcn/ui, TypesScript, React Query
- **Backend:** NestJS, Fastify, TypesScript, Drizzle ORM, Zod, vitest, swc compiler, Passport Auth
- **Banco:** PostgreSQL
- **Storage:** AWS S3
- **Emails:** Resend API
- **Pagamentos:** Stripe

## Architecture goal:
- scalable
- maintainable
- modular
- testable

## Repository Structure
- .github/
- .claude/
- backend/
- frontend/
- docs/
- .gitignore
- README.md

## Backend Architecture

The backend will be a Rest API with this structure():

src/

    config/
      - database/
        - migrations/
        - schema/
        - database.module.ts
        - database.config.ts
        - migrate.ts
        - reset-migrations.ts
        - seed.ts
      - env/
        - index.ts
      - logger.config.ts
    - modules/ (each module will have this minimal structure)
      - moduleFoltder/
        -  moduleName.module.ts
        - context/
            - routeName/
              - routeName.controller.ts
              - routeName.service.ts
              - dtos/
                - request.dto.ts
                - response.dto.ts
              - tests/
                - routeName.controller.spec.ts
                - routeName.service.spec.ts
    - shared/
      - constants/
      - decorators/
      - providers/
      - dtos/ (shared dtos, like pagination, error responses, etc)
      - enums/
      - exceptions/ (and custom exceptions)
      - guards/
      - interceptors/
      - filters/ (error handling)
      - interfaces/
      - utils/
      app.module.ts
      main.ts
      Dockerfile
    
## Frontend Architecture

The frontend will be a Nextjs Application with this structure:

src/

   app/
   - (auth)/ (auth pages -> login, register, forgot-password, reset-password)
   - [personal-slug]/
     - (personal)/
     - (students)/
   - global.css
   - layout.tsx
   - page.tsx
  - components/
  - hooks/
  - lib/
  - services/
  - store/
  - providers/ (context providers (react query provider, auth provider, etc))
  - middleware.ts

## Typescript Standards:
Always use the most specific type possible.
Avoid using `any` type.

Rules:
 - avoid any
 - prefer explicit interfaces
 - use zod for validation
 - use zod for request validation

# API Desing
API must follow REST principles
Rules:

- predictable routes
- proper HTTP status codes
- validation using DTOs
- consistent error format:
{
    timestamp: string,
    statusCode: number,
    message: string,
    error: string,
    timestamp: string,
    path: string,
    details
}
- Pagination format must follow this structure:
{
    content: T[],
    page: number,
    size: number,
    totalElements: number,
    totalPages: number,
}

# Frontend standarts
- Responsive design
- Mobile first
- Accessibility
- Performance
- SEO
- Use shadcn/ui components
- Use tailwindcss for styling
- Use typescript for type safety
- Use react query for data fetching
- Use zod for validation
- Avoid Unnecessary re-renders
- Use react hook form for form handling
- Avoid using local colors, use the theme colors
- Avoid using local fonts, use the theme fonts
- Avoid using local icons, use the theme icons
- Use Masks for phone numbers, zip codes, etc (with good experience for the user)
- If shadcn has a component for something, use it (but if it doesn't fit the design, create a new one)
- for the Perosnal (management) area use light mode only
- for the Admin(my area to control the saas) and Student area use dark mode only


# Testing  standarts

BackEnd:
 - unit tests (always):
   - Create first the test (tests will fail at this point but is not a problem we using the TDD strategy)
    - Test must follow this structure:
        - describe
        - it
            - expect
    Test must be isolated, so mock the dependencies
    Always test the happy path and the errors paths
   - After the tests create the implementation
   - Run tests again all tests need pass  
 - integration tests (when expliced asks for user)

FrontEnd:
  - nothing for now

## Security
Mandatory practices:
- never expose secrets use .env file
- use argon2id for password hashing
- use jwt for authentication
- use rate limiting (not now but in the future)
- use validation server-side
- use validation client-side
- validate all input
- sanitize user content
- enforce authentication where required
- role based access control
    
## AI Agents Rules
All AI agents must:
- respect this architecture
- avoid introducing unnecessary complexity
- prioritize readability and maintainability
- follow existing patterns before introducing new ones

## Communication Rules
- Always respond in Portuguese
- Code comments must be in English
- Commit messages must be in English
- Commit messages must follow the Conventional Commits specification
- Commit messages must follow the Gitmoji specification

## Development Philosophy
- TDD (Test-Driven Development) First
- Maintainability
- Simplicity First (Do not introduce complexity unless necessary.)
- Clarity Over Cleverness (Code should be easy to understand, Avoid clever solutions that reduce clarity.)
- Consistency (Follow the existing patterns and styles.)
- Incremental Development (Build small, working pieces and iterate.)
- Security by Default (Every feature must consider security. Always validate input and protect sensitive data.)
- Performance Awareness (Be mindful of performance implications, but don't optimize prematurely.)
- Respect the Architecture
