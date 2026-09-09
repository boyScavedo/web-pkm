<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Workflow Contract (hard rules)

These rules are binding for every contribution, human or agent.

## Branch model

- `main` — production. Only reached via `dev` after a full green regression. Nobody commits to `main` directly.
- `dev` — integration trunk. All `feature/*`, `issue/*`, `fix/*` branches merge here. This is where integration happens; also the Vercel preview deployment.
- `feature/*` — phase work. Each feature gets its own branch with its own unit + E2E tests. Merges to `dev` via squash PR; branch deleted.
- `issue/*` or `fix/*` — bug fixes. Created from a GitHub issue. Merges to `dev` via squash PR.

## Databases (Neon)

Actual topology (verified 2026-09-09): PRD and DEV are TWO separate Neon
projects; `preview` is a branch inside the PRD project. NOT one project with
mirroring branches.

- `production` (PRD project, git `main`): `PROD_DATABASE_URL` / `PROD_DATABASE_URL_UNPOOLED`.
  Migrated ONLY inside the dev→main runbook after preview verifies the schema.
- `development` (DEV project, git `dev` + all feature/* work): `DEV_DATABASE_URL` / `DEV_DATABASE_URL_UNPOOLED`.
- `preview` (branch in PRD project, Vercel previews): `PREVIEW_DATABASE_URL` / `PREVIEW_DATABASE_URL_UNPOOLED`.

The active database is `DATABASE_URL` / `DATABASE_URL_UNPOOLED`. Local dev and
integration tests point it at `development`; Vercel preview scope points it at
`preview`; production deploy points it at `production`. Migrations run against
`*_UNPOOLED` (direct connection; pooled rejects DDL). See WORKFLOW.md "DB
staging runbook" for the dev→main structure gate: one strict order — extensions
(`ltree`, `pg_trgm`) → `db:migrate` → `triggers.sql`.

## Phase workflow (in order)

1. **Check GitHub for existing open issues.** Any open → fix serially, no subagents: create `issue/*` or `fix/*` branch → `gh` PR → tests → merge to `dev`. Repeat until `dev` has zero open issues.
2. **New-issue scan (optional chore).** Scan only the last few commits, not the whole codebase. If issues found → report only, do not fix.
3. **Write the phase.** Analyze phase docs. Up to 3 subagents, each on its own `feature/*` branch, each with unit + E2E tests.
4. **Merge features to `dev`.** Rerun all unit tests. If failures → fix issues → re-merge to `dev` → rerun until green.
5. **Full regression** on `dev`: all unit tests + all E2E tests. Only when this passes, open the `dev` → `main` PR and ask the human to review. **Always open that PR as soon as `dev` is green** — even if the human says they will review the dev preview first. It is never auto-merged and the commit never stalls.

## Test gate (mandatory before every commit and merge)

- `npm run test` runs EVERYTHING at once: unit + integration + E2E.
- `npm run typecheck` and `npm run lint` must pass.
- E2E runs on every `feature/*` and `issue/*` merge, not just main.

## Commits

- Conventional commits. One logical change per commit.
- Chronological history on `dev`. `feature/*` and `issue/*` merge to `dev` via
  **squash** PR (one commit per logical change, branch auto-deleted). The PR
  stays open forever as the canonical debug record — never make changes that
  bypass a PR on `dev`.
- `dev` → `main` merge is a **merge commit**, always reviewed by the human — never auto-merged.
- Branch protection (enforced in GitHub): `dev` and `main` require a PR and the
  `test` CI check; `main` enforces on admins too.
- If a committed change is later found buggy: open a GitHub issue (`gh issue create`), then fix via an `issue/*`/`fix/*` branch → PR → merge to `dev`.

## Agent rules

- No untested code reaches `main`. If you cannot run the full test suite, say so and block the merge.
- Tests must be legitimate: unit tests (Vitest) + integration (real DB) + E2E (Playwright). No fake/empty stubs to "pass".
- Max 3 parallel subagents during phase work; serial fixes for issue triage (issues depend on each other's data).
- Update `docs/00-project/CURRENT_STATE.md`, `docs/11-progress/CHANGELOG.md`, `docs/11-progress/KNOWN_ISSUES.md` as part of any phase completion.
- Secrets live in `.env.local` (gitignored, chmod 600). `.env` holds DB URLs and is also gitignored. Never commit either.