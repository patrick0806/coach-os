# Multi-Tenancy Rules - Coach OS

This rule defines the mandatory requirements for multi-tenant data isolation and security.

## Data Isolation

- **Mandatory Tenant ID**: Every table in the database must include a `tenantId`.
- **Query Filtering**: Every query executed must explicitly filter by `tenantId`.
- **Isolation Enforcement**: Cross-tenant data access is strictly forbidden and must be handled at the repository or service layer.
- **Security Check**: Ensure all API requests identify the tenant through valid session context (e.g., JWT).
