import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { getDb } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import {
  createNote,
  getEditableNote,
  getNote,
  getOrCreateDefaultWorkspace,
  listNotes,
  restoreNote,
  softDeleteNote,
  updateNote,
  NotesError,
} from "@/lib/pkm/notes";
import { inArray } from "drizzle-orm";

// Integration tests run against the live development Neon branch and WRITE
// rows. Each marker is unique per run and cleaned up in afterAll, so the
// shared dev DB stays pristine.

const marker = `itest-${Date.now()}`;
const db = getDb();
let workspaceId: string;
const createdIds: string[] = [];

beforeAll(async () => {
  workspaceId = await getOrCreateDefaultWorkspace();
});

afterAll(async () => {
  if (createdIds.length === 0) return;
  await db.delete(notes).where(inArray(notes.id, createdIds));
});

describe("notes service", () => {
  test("provisions the default workspace", async () => {
    expect(workspaceId).toBeTruthy();
    // idempotent — calling again returns the same workspace
    const again = await getOrCreateDefaultWorkspace();
    expect(again).toBe(workspaceId);
  });

  test("create then get a note", async () => {
    const created = await createNote(workspaceId, {
      title: `${marker}-create`,
      content: "hello #content",
      para: "inbox",
      status: "draft",
    });
    createdIds.push(created.id);

    const fetched = await getNote(workspaceId, created.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.title).toBe(`${marker}-create`);
    expect(fetched!.content).toBe("hello #content");
    expect(fetched!.para).toBe("inbox");
    expect(fetched!.isDeleted).toBe(false);
  });

  test("create rejects empty title", async () => {
    await expect(createNote(workspaceId, { title: "   " })).rejects.toThrow(
      NotesError,
    );
  });

  test("update changes title, content, para, favorite", async () => {
    const created = await createNote(workspaceId, {
      title: `${marker}-update`,
    });
    createdIds.push(created.id);

    const updated = await updateNote(workspaceId, created.id, {
      title: `${marker}-update-v2`,
      content: "new body",
      para: "project",
      isFavorite: true,
    });
    expect(updated.title).toBe(`${marker}-update-v2`);
    expect(updated.content).toBe("new body");
    expect(updated.para).toBe("project");
    expect(updated.isFavorite).toBe(true);
  });

  test("update missing note throws NOT_FOUND", async () => {
    await expect(
      updateNote(workspaceId, "00000000-0000-0000-0000-000000000000", {
        title: "x",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("list returns notes with pagination", async () => {
    const result = await listNotes(workspaceId, { limit: 5 });
    expect(Array.isArray(result.notes)).toBe(true);
    expect(result.pagination.limit).toBe(5);
    expect(result.pagination.total).toBeGreaterThan(0);
    // our marker notes are included
    const titles = result.notes.map((n) => n.title);
    expect(titles).toEqual(expect.arrayContaining([`${marker}-create`]));
  });

  test("list filters by para", async () => {
    const result = await listNotes(workspaceId, { para: "inbox", limit: 50 });
    const marked = result.notes.filter((n) => n.title.includes(marker));
    expect(marked.every((n) => n.para === "inbox")).toBe(true);
  });

  test("list filters by favorite", async () => {
    const result = await listNotes(workspaceId, {
      favorite: true,
      limit: 50,
    });
    const marked = result.notes.filter((n) => n.title.includes(marker));
    expect(marked.some((n) => n.title === `${marker}-update-v2`)).toBe(true);
  });

  test("clamps limit to 100", async () => {
    const result = await listNotes(workspaceId, { limit: 999 });
    expect(result.pagination.limit).toBe(100);
  });

  test("soft delete hides from list, restore brings back", async () => {
    const created = await createNote(workspaceId, {
      title: `${marker}-soft`,
    });
    createdIds.push(created.id);

    await softDeleteNote(workspaceId, created.id);

    const listResult = await listNotes(workspaceId, { limit: 100 });
    const inList = listResult.notes.find((n) => n.id === created.id);
    expect(inList).toBeUndefined();

    const raw = await getNote(workspaceId, created.id);
    expect(raw?.isDeleted).toBe(true);

    await restoreNote(workspaceId, created.id);
    const restoredList = await listNotes(workspaceId, { limit: 100 });
    expect(restoredList.notes.find((n) => n.id === created.id)).toBeDefined();
  });

  test("soft delete missing note throws NOT_FOUND", async () => {
    await expect(
      softDeleteNote(workspaceId, "00000000-0000-0000-0000-000000000000"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("getEditableNote throws on not found", async () => {
    await expect(
      getEditableNote(workspaceId, "00000000-0000-0000-0000-000000000000"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});