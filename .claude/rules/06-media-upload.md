# Media Upload Rules - Coach OS

This rule defines the protocol for handling file and media uploads to ensure scalability and security.

## Core Rule

- **Indirect Handling**: The backend must **never** handle file uploads directly.
- **Presigned URLs**: All uploads must use presigned URLs.

## Upload Workflow

1. **Frontend Request**: Frontend requests a presigned URL from the backend.
2. **Backend Generation**: Backend generates a signed S3 upload URL with appropriate permissions and metadata.
3. **Frontend Upload**: Frontend uploads the file directly to the S3 bucket using the presigned URL.
4. **Finalization**: Frontend sends the resulting file URL (and any relevant metadata) back to the backend.
