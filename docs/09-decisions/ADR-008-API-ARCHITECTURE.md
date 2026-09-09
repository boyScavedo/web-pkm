# ADR-008: Domain Service Layer API Architecture

## Status

Accepted

## Context

We need an API architecture that supports Next.js UI, Flutter mobile,
and external tools — all consuming the same PKM operations.

## Decision

Three-layer architecture: Service Layer → Route Handlers → React Components.

```
lib/pkm/notes.ts      (service: domain logic, DB queries)
app/api/notes/route.ts (handler: HTTP interface, auth, validation)
components/notes/      (UI: React components calling handlers)
```

## Alternatives considered

- **Direct Drizzle in components**: Simpler, but creates tight coupling.
  Flutter can't reuse it. Testing requires full Next.js server.
- **Separate backend service**: More complex operations. Overkill for
  single-user PKM. "Next.js only" is the constraint.
- **tRPC**: Good type safety, but adds a layer. REST is simpler for
  external consumers (Flutter, scripts).

## Reasoning

- Service functions are pure TypeScript — testable without HTTP
- Route Handlers provide HTTP interface for Flutter and external tools
- Same service functions power both web UI and API
- Clean separation: change DB without changing UI, change UI without changing API
- REST endpoints are universally consumable

## Consequences

- Slightly more code than direct-component queries
- Each feature requires: service function, route handler, React component
- But testability and reusability justify the structure
- Future: extract `lib/pkm/` into a shared package if Flutter needs it
