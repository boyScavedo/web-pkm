# Workflow Contract

The operating systems rule for web-pkm. Human and agent both bound by it.

## Branch model

```
                          full regression
feature/* ──PR──► dev ─────────────────► main
issue/*   ──PR──► dev        (human-reviewed, only when green)
                    ▲
                    └──── all work integrates here
```

- **`main`** — production. Only reached from `dev` after a full green regression
  (all unit + integration + E2E). Nobody commits to `main` directly.
- **`dev`** — integration trunk. Every `feature/*`, `issue/*`, `fix/*` merges
  here. This is also the Vercel preview/production frontier before release.
- **`feature/*`** — phase work. One branch per feature, its own unit + E2E tests.
  Merges to `dev` via **squash** PR; branch deleted after merge.
- **`issue/*`** / **`fix/*`** — created from a GitHub issue; fixes any defect.
  Merges to `dev` via **squash** PR.

## Databases (Neon)

Actual topology (verified 2026-09-09): PRD and DEV are TWO separate Neon
projects; `preview` is a branch inside the PRD project. NOT one project with
mirroring branches.

| Git | Neon | Env vars |
|-----|------|----------|
| `main` | PRD project (`ep-patient-glitter-awvt49ko`), main branch | `PROD_DATABASE_URL`, `PROD_DATABASE_URL_UNPOOLED` |
| `dev`, `feature/*`, `issue/*` | DEV project (`ep-ancient-star-aw8qjebk`) | `DEV_DATABASE_URL`, `DEV_DATABASE_URL_UNPOOLED` |
| Vercel previews | `preview` branch in PRD project | `PREVIEW_DATABASE_URL`, `PREVIEW_DATABASE_URL_UNPOOLED` |

- The **active** DB is `DATABASE_URL` / `DATABASE_URL_UNPOOLED`. Locally it
  points at `development`; Vercel preview deployments point it at `preview`;
  production deploy points it at `production`. Vercel scopes: preview env uses
  `DATABASE_URL`/`DATABASE_URL_UNPOOLED` = `PREVIEW_*` (pooled + direct); prod
  env uses `PROD_*`.
- Migrations ALWAYS run against `*_UNPOOLED` — pgbouncer/pooled rejects DDL.
- Structure-to-a-DB order is strict: (1) `CREATE EXTENSION ltree`, (2) `CREATE
  EXTENSION pg_trgm`, (3) `db:migrate` (drizzle), (4) `psql ... -f
  src/lib/db/triggers.sql`.

## DB staging runbook (dev → main promotion)

Production DB is not migrated until the promoted code is verified in preview.
Structure is staged on a fresh `preview` branch first; Vercel previews exercise
it; production is migrated at merge time.

1. `dev` fully green (test gate below) → open the `dev` → `main` PR (always).
2. **Stage the preview DB.** Refresh the PRD `preview` branch from the PRD main
   snapshot (or recreate it), then apply structure to it in the strict order
   above. `neonctl` commands (run from the PRD project context):
   ```bash
   neonctl branches create --name preview --project-id awvt49ko --type read_write
   # URLs: neonctl connection-strings --branch preview --project-id awvt49ko \
   #        --role neondb_owner --pooled / --direct
   neonctl extensions create ltree    --branch preview --project-id awvt49ko
   neonctl extensions create pg_trgm  --branch preview --project-id awvt49ko
   DATABASE_URL_UNPOOLED=<preview direct> npm run db:migrate
   psql <preview direct> -f src/lib/db/triggers.sql
   ```
3. **Wait for the Vercel preview deployment** of the dev→main PR (already
   wired to `preview`; see env scopes above). Human verifies it end to end.
   Confirm the preview DB holds the new schema (`\dt` shows the struct).
4. Merge `dev` → `main`. **Immediately migrate production** in the same strict
   order using `PROD_DATABASE_URL_UNPOOLED`:
   ```bash
   psql "$PROD_DATABASE_URL_UNPOOLED" -c 'CREATE EXTENSION IF NOT EXISTS ltree; CREATE EXTENSION IF NOT EXISTS pg_trgm;'
   DATABASE_URL_UNPOOLED="$PROD_DATABASE_URL_UNPOOLED" npm run db:migrate
   psql "$PROD_DATABASE_URL_UNPOOLED" -f src/lib/db/triggers.sql
   ```
   If the production migration fails, the PR is reverted before it ships —
   the preview branch still holds the identical, verified schema for reference.
5. Smoke-test production.

Existing dev data is never in preview: preview is a schema-validation env that
snapshots the production base and applies the incoming migrations. Test data
lives in the DEV project.

## Phase workflow (strict order)

1. **Check GitHub for open issues.** `gh issue list`. Any open → resolve
   serially (NO subagents; issues share data): `issue/*` branch → `gh` PR →
   tests → merge to `dev`. Repeat until zero open issues.
2. **New-issue scan (optional).** Scan the last few commits only — not the
   whole codebase (that is a chore the human runs on demand). If found:
   **report only**, do not fix.
3. **Write the phase.** Analyze phase docs in `docs/10-phases/`. Delegate to
   up to 3 subagents, each on its own `feature/*` branch. Each agent writes its
   own unit tests + E2E tests — real tests, no stubs.
4. **Merge features to `dev`.** Rerun ALL unit tests. On failure → file/fix
   issues (step 1 flow) → re-merge → rerun until green.
5. **Full regression on `dev`.** All unit + integration + E2E. Only when this
   passes, open the `dev` → `main` PR for human review. Never auto-merge main.

## Test gate

Mandatory before every commit and every merge:

```bash
npm run test        # EVERYTHING: unit + integration + E2E (serially)
npm run typecheck
npm run lint
```

- E2E runs on every `feature/*` and `issue/*` merge — not just at `main`.
- Tests must derive from real behavior:
  - Unit (Vitest): service functions, parsers, validators.
  - Integration (Vitest + real DB): route handlers, search, migrations.
  - E2E (Playwright): full browser workflows against the `development` branch.
- A test that cannot fail is not a test. Empty `.it()` stubs are rejected.

## Commits

- Conventional Commits. One logical change per commit.
- Chronological order on `dev`; feature/issue merges squash in merge order.
- **Merge strategy (enforced in GitHub settings + branch protection):**
  - `feature/*` → `dev` and `issue/*` → `dev`: **squash and merge** — one commit
    per logical change on `dev`, branch auto-deleted. Every PR stays open forever
    (squash commit links to `refs/pull/N/merge`), so per-commit WIP detail and
    review discussion remain the canonical debug record.
  - `dev` → `main`: **merge commit**, human-reviewed, never auto-merged.
    The `dev` → `main` PR is **always opened as soon as `dev` is green** —
    even when the human plans to smoke-test the dev/preview deployment first.
    The PR documents the promotion so the commit never stalls; the human
    merges it when they are ready.
- Branch protection: `dev` and `main` require a PR, require the `test` CI check,
  and block direct pushes. `main` also enforces on admins.
- If a merged change is later found buggy: `gh issue create` → `fix/*` branch →
  PR → merge to `dev` → regression → main.
- Commits touching `.env*` are forbidden. Secrets live in `.env.local`
  (gitignored, `chmod 600`); `.env` holds DB URLs and is gitignored too.

## Agent rules

- Max 3 parallel subagents during phase work.
- Issue triage is strictly serial — issues are data-coupled.
- If you cannot run the full suite, state it and BLOCK the merge. Never let
  untested code reach `main`.
- Phase completion updates `docs/00-project/CURRENT_STATE.md`,
  `docs/11-progress/CHANGELOG.md`, `docs/11-progress/KNOWN_ISSUES.md`.

## Environment (local)

- `npm run dev` — development server
- `npm run db:migrate` — applies migrations to the ACTIVE (`DATABASE_URL_UNPOOLED`) DB. Use `DATABASE_URL_UNPOOLED` values manually for cross-branch migration.
- `npm run db:studio` — Drizzle Studio
- `.env.local` overrides `.env`; keep secrets in `.env.local` only.