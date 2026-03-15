# Security Rules - Coach OS

This rule outlines the mandatory security standards and validation protocols for the application.

## Authentication & Passwords

- **Authentication**: JWT access tokens for sessions. Refresh tokens must be stored in `http-only` cookies for security.
- **Passwords**: Must be hashed using the **Argon2id** algorithm.

## Validation

- **Input Validation**: All incoming data (query, param, body) **must** be validated using **Zod**.
- **Sanitization**: Ensure inputs are cleaned before processing, especially in database operations.
