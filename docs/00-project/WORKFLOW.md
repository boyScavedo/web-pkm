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
- **`issue/*`** / **`fix/*`** — created from a GitHub issue; fixes any defect.

## Databases (Neon)

Neon branches mirror git branches exactly.

| Git | Neon | Env vars |
|-----|------|----------|
| `main` | `main` | `PROD_DATABASE_URL`, `PROD_DATABASE_URL_UNPOOLED` |
| `dev`, `feature/*`, `issue/*` | `development` | `DEV_DATABASE_URL`, `DEV_DATABASE_URL_UNPOOLED` |

- The **active** DB is `DATABASE_URL` / `DATABASE_URL_UNPOOLED`. Locally and in
  Vercel preview it points at `development`; production deploy points it at `main`.
- Migrations ALWAYS run against `*_UNPOOLED` — pgbouncer/pooled rejects DDL.
- Extension requirements: `ltree`, `pg_trgm` must exist on the branch before
  the migration that references them runs.

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
- `dev` → `main` is a human-reviewed PR, never auto-merged.
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