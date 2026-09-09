# ADR-004: Cloudflare R2 Storage

## Status

Accepted

## Context

We need binary/file storage for images, attachments, exported vaults, and
imported assets. Neon is not for binary storage.

## Decision

Use Cloudflare R2 for object/file storage.

## Alternatives considered

- **AWS S3**: Industry standard, more features, but more complex pricing, harder to set up, higher egress costs.
- **Supabase Storage**: Tied to Supabase. We use Neon.
- **Vercel Blob**: Simple, but Vercel-specific, less portable.
- **Local filesystem**: Not viable on Vercel serverless (ephemeral).

## Reasoning

- S3-compatible API (easy to swap to S3/MinIO later)
- Zero egress fees (important for asset-heavy PKM)
- 10GB free tier (generous for PKM assets)
- Works well with presigned URLs for direct browser upload
- Presigned URLs avoid routing large files through Next.js server

## Consequences

- R2 credentials needed (ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME)
- Presigned URL flow: Next.js generates signed URL, browser uploads directly to R2
- Asset metadata stored in PostgreSQL, binary in R2
- Storage abstraction layer in `lib/storage/` allows swapping implementation
- Public URL via custom domain or R2 public access for serving assets
