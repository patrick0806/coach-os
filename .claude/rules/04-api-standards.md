# API Standards - Coach OS

This rule defines the consistent format for all API responses across the Coach OS platform.

## Response Formats

### Success Response
```json
{
  "data": T
}
```

### Error Response
```json
{
  "timestamp": "string",
  "statusCode": 400,
  "message": "Human readable message",
  "error": "Error code or summary",
  "path": "/api/endpoint"
}
```

### Pagination Response
```json
{
  "content": T[],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10
}
```
