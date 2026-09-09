# Master Plan

## Vision

A personal knowledge infrastructure where the PKM is the canonical data layer.
Everything else (projects, content, life OS) is an application built on top.

## Architecture

```
                    PKM CORE
                        |
                  DOMAIN/API LAYER
                        |
          +-------------+-------------+
          |             |             |
       Web App      Flutter App   Future Apps
          |
  +-------+-------+
  |       |       |
Projects Content  Life OS
  |       |       |
  +-------+-------+
          |
        PKM
```

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 00 | Research + System Design | DONE |
| 01 | Foundation (Next.js, Drizzle, Auth, Shell) | DONE |
| 02 | Notes CRUD (service, API, list/create/edit UI) | DONE |
| 03 | Markdown Editor / Reader (Tiptap) | PENDING |
| 04 | Properties, Folders, Tags | PENDING |
| 05 | Link Graph (wikilinks, backlinks, rename-safe) | PENDING |
| 06 | Search (FTS, fuzzy, filtered) | PENDING |
| 07 | Asset System (R2 upload, metadata, CDN) | PENDING |
| 08 | Import / Export (Markdown vault, ZIP) | PENDING |
| 09 | PKM Dashboard (inbox, recent, orphans, broken links) | PENDING |
| 10 | Revision / History | PENDING |
| 11 | PKM API (clean REST endpoints) | PENDING |
| 12 | Project Management | PENDING |
| 13 | Content Creation OS | PENDING |
| 14 | Life OS | PENDING |
| 15 | Unified Command Center | PENDING |
| 16 | Flutter API Readiness | PENDING |
| 17 | Hardening (security, performance, a11y, QA) | PENDING |

## Completion criteria per phase

- Implementation exists
- Architecture docs updated
- Relevant tests exist
- Playwright tests pass where applicable
- Build passes
- Lint passes
- Migrations work
- No obvious security regression
- UX manually inspected where applicable
- Known issues documented
- CHANGELOG updated
- CURRENT_STATE updated
