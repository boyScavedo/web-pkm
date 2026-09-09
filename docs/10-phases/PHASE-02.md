# Phase 02: Notes CRUD

## Status: COMPLETE

## Objectives

Real notes end to end: service layer (ADR-008) over the `notes` table, REST
API routes with a `{data,error}` envelope, and a working notes list / create /
edit UI driven by PARA filters. Strong backend first; the frontend stays a
plain textarea.

## Scope

- **Service layer** `src/lib/pkm/notes.ts`: `createNote`, `getNote`,
  `getEditableNote` (404-aware), `listNotes` (limit/offset pagination,
  `para` / `status` / `favorite` filters, `sort`/`order`), `updateNote`,
  `softDeleteNote`, `restoreNote`, lazy `getOrCreateDefaultWorkspace`
- **API routes** (all session-guarded, all under `/api/notes`):
  - `GET /api/notes` — list + pagination (`?para=&status=&favorite=&sort=&order=&limit=&offset=`)
  - `POST /api/notes` — create (title, content, para, status, isFavorite, folderId)
  - `GET /api/notes/[id]` — single note (404 on missing/deleted)
  - `PATCH /api/notes/[id]` — partial update
  - `DELETE /api/notes/[id]` — soft delete
  - `POST /api/notes/[id]/restore` — un-delete
- **UI**:
  - `/notes` — real list (server-rendered, `?para=` filter from Sidebar PARA links)
  - `/notes/new` — create form (title, markdown textarea, para, status, favorite)
  - `/notes/[id]` — view + edit form (same fields) + soft delete
- **Tests**: unit (param helpers), integration (real dev Neon, self-cleaning
  marker rows), E2E (create → edit → para filter → delete)

## Out of scope (later phases)

- Tiptap editor / markdown rendering (Phase 04)
- Folders UI, tags UI, search (FTS), wikilinks/backlinks
- Trash/archive UI (restore endpoint exists; no UI yet)
- Hard delete, orphan cleanup, note revisions browsing

## Key decisions

- Default workspace provisions itself lazily on first use (slug `default`);
  the app is single-user so this is a constant. Per-user workspaces if the
  account model grows.
- List ordering: `updated_at` desc by default; `sort=title|created_at`,
  `order=asc|desc` supported. Flat limit/offset (limit default 20, clamp 100).
- Wire shape is explicit per-endpoint (never spread the drizzle row) so
  computed columns (`searchVector`, `workspaceId`) never leak.
- The old `db.test.ts` "workspaces table is pristine" assertion was stale
  once Phase 02 provisioned the default workspace; it now provisions
  idempotently and asserts only `slug = ["default"]`.

## Files touched

- `src/lib/pkm/notes.ts` — service layer (new)
- `src/lib/http.ts` — `ok`/`fail`/`requireUser`/`readJson`/`parseId` helpers (new)
- `src/app/api/notes/route.ts`, `[id]/route.ts`, `[id]/restore/route.ts` (new)
- `src/app/(app)/notes/page.tsx`, `notes/new/page.tsx`, `notes/[id]/page.tsx` (replaced placeholders)
- `src/components/notes/NoteEditor.tsx` (new, shared create/edit form)
- `tests/unit/notes.test.ts`, `tests/integration/notes.test.ts`, `e2e/notes.spec.ts` (new)
- `tests/integration/db.test.ts` (pristine-workspace assertion updated)
- `e2e/auth.spec.ts` (empty-vault assertion → "page renders after sign-in")

## Completion evidence

- `npm run typecheck` green (incl. `next typegen`)
- `npm run lint` green (0 warnings)
- `npm run test` green: 15 unit + 16 integration + 4 E2E
- `npm run build` green; routes all dynamic (ƒ)
- Initial status on DB before this phase: workspaces row count 0 (per old
  db.test.ts). After: exactly one `default` workspace.