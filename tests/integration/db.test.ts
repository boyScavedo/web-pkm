import { beforeAll, describe, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, workspaces } from "@/lib/db/schema";

// Integration tests run against the real database (development Neon branch),
// read-only schema assertions. They never mutate user data.
const db = getDb();

beforeAll(async () => {
  await db.execute(sql`select 1`);
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

  test("no rows in workspace/users yet (pristine dev db)", async () => {
    const [u, w] = await Promise.all([
      db.select().from(users),
      db.select().from(workspaces),
    ]);
    expect(u).toHaveLength(0);
    expect(w).toHaveLength(0);
  });
});