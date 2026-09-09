import { beforeAll, describe, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getOrCreateDefaultWorkspace } from "@/lib/pkm/notes";
import { users, workspaces } from "@/lib/db/schema";

// Integration tests run against the real database (development Neon branch).
// Schema assertions are read-only; only the lazy default-workspace provision
// mutates data (idempotent, matches the app's own first-use behavior).
const db = getDb();

beforeAll(async () => {
  await db.execute(sql`select 1`);
  // Phase 02 provisioned the default workspace lazily; make it deterministic
  // regardless of test-file execution order.
  await getOrCreateDefaultWorkspace();
});

describe("database schema", () => {
  test("all 17 tables exist", async () => {
    const rows = await db.execute<{ tablename: string }>(sql`
      select tablename from pg_tables
      where schemaname = 'public'
      order by tablename
    `);
    const names = rows.rows.map((r) => r.tablename);
    expect(names).toEqual(
      expect.arrayContaining([
        "accounts",
        "assets",
        "folders",
        "note_assets",
        "note_links",
        "note_properties",
        "note_revisions",
        "note_tags",
        "notes",
        "project_notes",
        "projects",
        "sessions",
        "tags",
        "users",
        "verification_tokens",
        "workspace_users",
        "workspaces",
      ]),
    );
  });

  test("ltree and pg_trgm extensions are installed", async () => {
    const rows = await db.execute<{ extname: string }>(sql`
      select extname from pg_extension
      where extname in ('ltree', 'pg_trgm')
      order by extname
    `);
    const names = rows.rows.map((r) => r.extname);
    expect(names).toEqual(["ltree", "pg_trgm"]);
  });

  test("revision trigger is installed on notes", async () => {
    const rows = await db.execute<{ tgname: string }>(sql`
      select tgname from pg_trigger
      where tgname = 'trg_note_revision' and not tgisinternal
    `);
    expect(rows.rows).toHaveLength(1);
  });

  test("no stale users; workspaces contain default plus transient itest markers", async () => {
    const [u, w] = await Promise.all([
      db.select().from(users),
      db.select().from(workspaces),
    ]);
    expect(u).toHaveLength(0);
    // Phase 02 lazily provisions one default workspace on first use. Other
    // test files may hold a throwaway `itest-race-*` workspace mid-flight
    // (parallel files), so tolerate `itest-` markers; anything else is stale.
    const slugs = w.map((row) => row.slug).filter((s) => !s.startsWith("itest-"));
    expect(slugs).toEqual(["default"]);
  });
});