# Obsidian Analysis

## What Obsidian does well

- Markdown as file format (local-first, portable)
- Bidirectional linking with [[]] syntax
- Backlinks panel and graph view
- Plugin ecosystem (community and official)
- Local files, no vendor lock-in
- Fast search across vault
- Templates and daily notes

## What we learn from Obsidian

- **Markdown as canonical format** — we follow this exactly
- **Wikilink syntax** — [[Note]] and [[Note|Display text]]
- **Backlinks as a core feature** — not optional, not an afterthought
- **Fast search** — PostgreSQL FTS replaces file-based search
- **Link graph** — recursive CTE on note_links table

## What we do differently

- **Server-first, not local-first** — Obsidian is a local app with sync.
  We're a web app with a database. This enables API access, mobile clients,
  and external integrations.
- **Structured database, not flat files** — Properties, tags, and PARA
  are database columns with indexes, not file metadata.
- **No plugin system (yet)** — Build core features well before extensibility.
- **Single user, not collaborative** — No CRDT, no real-time collab.
- **API-first** — The PKM is a platform, not just a desktop app.

## Link syntax reference

```
[[Note Title]]
[[Note Title|Display text]]
[[Note Title#Heading]]
```

## Backlink resolution

When note A links to note B, note B's backlinks include note A.
This is maintained in the `note_links` table, not parsed at read time.
Renaming note B updates all `note_links` rows referencing it.
