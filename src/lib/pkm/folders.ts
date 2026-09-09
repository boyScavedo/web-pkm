import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { folders, notes } from "@/lib/db/schema";

// Folder service over the ltree `folders` table (ADR-009). All path math is
// done here; ltree subtree re-pathing uses native operators via raw SQL.

export class FolderError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "VALIDATION",
  ) {
    super(message);
  }
}

export type FolderRow = typeof folders.$inferSelect;

export interface FolderNode {
  id: number;
  name: string;
  path: string;
  children: FolderNode[];
}

// ltree label: lowercase a-z0-9_, no leading/trailing dots. Display name is
// preserved on the row; the label is the path identity.
export function folderLabel(name: string): string {
  const label = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!label) return "folder";
  return label.slice(0, 63);
}

// Obsidian-style conflict resolution: "name", "name (1)", "name (2)"...
// Returns the first free path under `prefix` (treated as "" when absent).
export async function freeFolderPath(
  workspaceId: string,
  prefix: string,
  name: string,
): Promise<string> {
  const db = getDb();
  const existing = new Set(
    (
      await db
        .select({ path: folders.path })
        .from(folders)
        .where(eq(folders.workspaceId, workspaceId))
    ).map((r) => r.path),
  );
  let candidate = name;
  for (let i = 0; i < 100; i++) {
    const suffix = i === 0 ? "" : ` (${i})`;
    const path = prefix ? `${prefix}.${folderLabel(candidate + suffix)}` : folderLabel(candidate + suffix);
    if (!existing.has(path)) return path;
    candidate = name;
  }
  throw new FolderError("Too many conflicting folders", "VALIDATION");
}

const folderColumns = {
  id: folders.id,
  name: folders.name,
  path: folders.path,
};

export async function listFolders(workspaceId: string): Promise<FolderRow[]> {
  const db = getDb();
  return db
    .select()
    .from(folders)
    .where(eq(folders.workspaceId, workspaceId))
    .orderBy(asc(folders.path));
}

// Assemble flat, path-sorted rows into a nested tree. Path segments are the
// identity; display names come from each row.
export function buildFolderTree(rows: FolderRow[]): FolderNode[] {
  const byId = new Map<number, FolderNode>();
  const roots: FolderNode[] = [];
  for (const row of rows) {
    const node: FolderNode = {
      id: row.id,
      name: row.name,
      path: row.path,
      children: [],
    };
    byId.set(row.id, node);
  }
  for (const row of rows) {
    const node = byId.get(row.id)!;
    const parentPath = row.path.split(".").slice(0, -1).join(".");
    const parent = parentPath
      ? [...byId.values()].find((n) => n.path === parentPath)
      : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

async function getFolder(workspaceId: string, folderId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(folders)
    .where(
      and(eq(folders.id, folderId), eq(folders.workspaceId, workspaceId)),
    )
    .limit(1);
  if (rows.length === 0) {
    throw new FolderError("Folder not found", "NOT_FOUND");
  }
  return rows[0];
}

export async function createFolder(
  workspaceId: string,
  name: string,
  parentId?: number | null,
) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new FolderError("Folder name is required", "VALIDATION");
  }

  let prefix = "";
  if (parentId) {
    const parent = await getFolder(workspaceId, parentId);
    prefix = parent.path;
  }

  const path = await freeFolderPath(workspaceId, prefix, trimmed);
  const db = getDb();
  const rows = await db
    .insert(folders)
    .values({ workspaceId, name: trimmed, path, parentId: parentId ?? null })
    .returning(folderColumns);
  return rows[0];
}

// Re-path a folder and every descendant (ltree <@ subtree scan).
async function repathSubtree(
  workspaceId: string,
  oldPath: string,
  newPrefix: string,
  newLeaf: string,
) {
  const db = getDb();
  const newPath = newPrefix ? `${newPrefix}.${newLeaf}` : newLeaf;
  await db.execute(sql`
    update folders
    set path = ${newPath}::ltree || (
      case when nlevel(path) <= nlevel(${oldPath}::ltree) then ''::ltree
      else subpath(path, nlevel(${oldPath}::ltree)) end
    )
    where workspace_id = ${workspaceId} and path <@ ${oldPath}::ltree
  `);
  return newPath;
}

export async function renameFolder(
  workspaceId: string,
  folderId: number,
  name: string,
) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new FolderError("Folder name is required", "VALIDATION");
  }
  const folder = await getFolder(workspaceId, folderId);
  const segments = folder.path.split(".");
  const prefix = segments.slice(0, -1).join(".");
  const conflictFree = await freeFolderPath(workspaceId, prefix, trimmed);
  const newPath = await repathSubtree(
    workspaceId,
    folder.path,
    prefix,
    conflictFree.split(".").pop()!,
  );

  const db = getDb();
  await db
    .update(folders)
    .set({ name: trimmed })
    .where(eq(folders.id, folderId));
  return { id: folderId, name: trimmed, path: newPath };
}

export async function moveFolder(
  workspaceId: string,
  folderId: number,
  newParentId: number | null,
) {
  const folder = await getFolder(workspaceId, folderId);

  let parentPath = "";
  if (newParentId) {
    const parent = await getFolder(workspaceId, newParentId);
    if (parent.id === folderId) {
      throw new FolderError("Cannot move a folder into itself", "VALIDATION");
    }
    // Cycle guard: reject when the target is inside the folder being moved.
    const db = getDb();
    const inside = await db
      .select({ id: folders.id })
      .from(folders)
      .where(
        and(
          eq(folders.workspaceId, workspaceId),
          sql`${folders.path} <@ ${folder.path}::ltree`,
          eq(folders.id, newParentId),
        ),
      )
      .limit(1);
    if (inside.length > 0) {
      throw new FolderError(
        "Cannot move a folder into one of its children",
        "VALIDATION",
      );
    }
    parentPath = parent.path;
  }

  const targetPath = await freeFolderPath(workspaceId, parentPath, folder.name);
  const newPath = await repathSubtree(
    workspaceId,
    folder.path,
    parentPath,
    targetPath.split(".").pop()!,
  );
  return { id: folderId, path: newPath };
}

// Deleting a folder deletes the subtree and soft-deletes contained notes
// (Obsidian semantics: files in the deleted folder go too).
export async function deleteFolder(workspaceId: string, folderId: number) {
  const folder = await getFolder(workspaceId, folderId);
  const db = getDb();

  const subtree = await db
    .select({ id: folders.id })
    .from(folders)
    .where(
      and(eq(folders.workspaceId, workspaceId), sql`${folders.path} <@ ${folder.path}::ltree`),
    );
  const ids = subtree.map((r) => r.id);

  if (ids.length > 0) {
    await db
      .update(notes)
      .set({ isDeleted: true, deletedAt: sql`now()` })
      .where(
        and(
          eq(notes.workspaceId, workspaceId),
          inArray(notes.folderId, ids as number[]),
        ),
      );
  }
  await db.execute(sql`
    delete from folders
    where workspace_id = ${workspaceId} and path <@ ${folder.path}::ltree
  `);
  return { id: folderId };
}