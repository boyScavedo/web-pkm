# System Boundaries

## What lives inside the PKM

- Notes (Markdown content + metadata)
- Folders (hierarchy)
- Tags (classification)
- Links (relationships)
- Properties (structured metadata)
- Assets (binary files metadata; actual files in R2)
- Search index (derived from notes)
- Revisions (history)
- Projects (Phase 12)
- Content items (Phase 13)
- Goals, areas, journal (Phase 14)

## What lives outside the PKM

- Authentication provider (NextAuth / Auth.js)
- Object storage (Cloudflare R2)
- Deployment platform (Vercel)
- Email service (for auth, future)

## Boundary rules

1. **No direct DB access from components.** Always through service layer.
2. **No R2 calls from components.** Always through storage abstraction.
3. **No auth logic in business code.** NextAuth handles sessions.
4. **No external API calls in service layer.** External calls happen in
   Route Handlers or dedicated integration modules.
5. **No state in URL beyond what's needed.** URL reflects note/folder/tag
   identity, not application state.

## Future boundaries

- **Flutter app**: Consumes the same API layer. No direct DB.
- **Public views**: Read-only subset of the API. No write access.
- **AI integrations**: Read-only API access. No write access without approval.
- **External tools**: Scoped API tokens with limited permissions.
