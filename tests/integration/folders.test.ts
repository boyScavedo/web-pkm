import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { notes, workspaces } from "@/lib/db/schema";
import { getOrCreateDefaultWorkspace, provisionWorkspace } from "@/lib/pkm/notes";
import {
  buildFolderTree,
  createFolder,
  deleteFolder,
  FolderError,
  listFolders,
  moveFolder,
  renameFolder,
} from "@/lib/pkm/folders";

let ws: string;
const slug = `itest-folders-${Date.now()}`;

beforeAll(async () => {
  ws = await provisionWorkspace(slug, "Folder test workspace");
});

afterAll(async () => {
  await getDb().delete(workspaces).where(eq(workspaces.slug, slug));
});

describe("folder CRUD", () => {
  test("create root and nested folders, auto-suffix conflicts", async () => {
    const a = await createFolder(ws, "Inbox");
    const b = await createFolder(ws, "Inbox"); // conflict -> suffix
    expect(b.path.split(".").pop()).toBe("inbox_1");
    const sub = await createFolder(ws, "Deep", a.id);
    expect(sub.path).toBe(`${a.path}.deep`);
  });

  test("rename re-paths the subtree", async () => {
    const root = await createFolder(ws, "RenameRoot");
    const child = await createFolder(ws, "Kid", root.id);
    const renamed = await renameFolder(ws, root.id, "RenamedRoot");
    expect(renamed.path).toMatch(/^renamedroot$/);
    const after = await listFolders(ws);
    const kidPath = after.find((f) => f.id === child.id)!.path;
    expect(kidPath).toBe(`${renamed.path}.kid`);
  });

  test("move re-paths subtree and rejects cycles", async () => {
    const a = await createFolder(ws, "MoveA");
    const b = await createFolder(ws, "MoveB", a.id);
    // move a into b -> cycle
    await expect(moveFolder(ws, a.id, b.id)).rejects.toThrow(FolderError);
    // move b to root
    await moveFolder(ws, b.id, null);
    const after = await listFolders(ws);
    expect(after.find((f) => f.id === b.id)!.path).toBe("moveb");
  });

  test("delete removes subtree and soft-deletes contained notes", async () => {
    const root = await createFolder(ws, "DelRoot");
    const child = await createFolder(ws, "DelChild", root.id);

    const note = await getDb().insert(notes).values({
      workspaceId: ws,
      title: "folders-integr-del",
      content: "",
      folderId: child.id,
    }).returning({ id: notes.id });

    await deleteFolder(ws, root.id);
    const after = await listFolders(ws);
    expect(after.find((f) => f.id === root.id)).toBeUndefined();
    expect(after.find((f) => f.id === child.id)).toBeUndefined();
    const noteAfter = await getDb()
      .select({ isDeleted: notes.isDeleted })
      .from(notes)
      .where(eq(notes.id, note[0].id))
      .limit(1);
    expect(noteAfter[0].isDeleted).toBe(true);
  });

  test("tree assembly matches listFolders", async () => {
    const rows = await listFolders(ws);
    const tree = buildFolderTree(rows);
    const flat = (nodes: typeof tree): number[] =>
      nodes.flatMap((n) => [n.id, ...flat(n.children)]);
    expect(flat(tree).sort()).toEqual(rows.map((r) => r.id).sort());
  });

  test("validation rejects empty names", async () => {
    await expect(createFolder(ws, "   ")).rejects.toThrow(FolderError);
  });
});

describe("workspace isolation", () => {
  test("folders live in their workspace", async () => {
    const otherWs = await getOrCreateDefaultWorkspace();
    const mine = await createFolder(ws, "Isolated");
    const other = await listFolders(otherWs);
    if (otherWs !== ws) {
      expect(other.map((f) => f.id)).not.toContain(mine.id);
    }
  });
});