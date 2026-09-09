import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { notes, workspaces } from "@/lib/db/schema";
import type {
  NoteSummary,
  ParaCategory,
  NoteStatus,
} from "@/types";

// ADR-008: service layer owns all domain logic + DB queries. Components and
// route handlers call these functions; nothing queries drizzle directly.

const DEFAULT_WORKSPACE_SLUG = "default";

export class NotesError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "VALIDATION",
  ) {
    super(message);
  }
}

// Single-user PKM: lazily provision a default workspace on first use.
// ponytail: get-or-create by constant slug; per-user workspaces if the
// account model ever grows.
export async function getOrCreateDefaultWorkspace(): Promise<string> {
  return provisionWorkspace(DEFAULT_WORKSPACE_SLUG, "Default");
}

// First-use provisioning must survive concurrent callers (layout + page
// render the same view): SELECT first, INSERT only when missing, and re-read
// the winner if a concurrent caller won the insert race.
export async function provisionWorkspace(
  slug: string,
  name: string,
): Promise<string> {
  const db = getDb();
  const existing = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  try {
    const inserted = await db
      .insert(workspaces)
      .values({ name, slug })
      .returning({ id: workspaces.id });
    return inserted[0].id;
  } catch (err) {
    // Concurrent provisioning: another caller inserted the row first.
    const winner = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);
    if (winner.length > 0) return winner[0].id;
    throw err;
  }
}

export interface NoteStats {
  isFavorite: boolean;
}

export type NoteSort = "updated_at" | "created_at" | "title";

export interface ListNotesOptions {
  para?: ParaCategory;
  status?: NoteStatus;
  favorite?: boolean;
  sort?: NoteSort;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export function clampLimit(limit?: number): number {
  if (limit === undefined || limit === null) return 20;
  return Math.min(Math.max(1, Math.floor(limit)), 100);
}

export function normalizeOffset(offset?: number): number {
  if (offset === undefined || offset === null) return 0;
  return Math.max(0, Math.floor(offset));
}

export interface NoteListResult {
  notes: NoteSummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  para?: ParaCategory;
  status?: NoteStatus;
  isFavorite?: boolean;
  folderId?: number;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  para?: ParaCategory;
  status?: NoteStatus;
  isFavorite?: boolean;
  folderId?: number | null;
}

const summaryColumns = {
  id: notes.id,
  title: notes.title,
  para: notes.para,
  status: notes.status,
  isFavorite: notes.isFavorite,
  isDeleted: notes.isDeleted,
  folderId: notes.folderId,
  updatedAt: notes.updatedAt,
  createdAt: notes.createdAt,
};

// ponytail: flat limit/offset pagination (API_SPEC allows it); cursor-based
// pagination if the list ever outgrows a few thousand rows.
export async function listNotes(
  workspaceId: string,
  options: ListNotesOptions = {},
): Promise<NoteListResult> {
  const db = getDb();
  const limit = clampLimit(options.limit);
  const offset = normalizeOffset(options.offset);

  const filters = [
    eq(notes.workspaceId, workspaceId),
    eq(notes.isDeleted, false),
  ];
  if (options.para) filters.push(eq(notes.para, options.para));
  if (options.status) filters.push(eq(notes.status, options.status));
  if (options.favorite !== undefined) {
    filters.push(eq(notes.isFavorite, options.favorite));
  }

  const where = and(...filters);

  let orderColumn:
    | typeof notes.title
    | typeof notes.updatedAt
    | typeof notes.createdAt = notes.updatedAt;
  if (options.sort === "created_at") orderColumn = notes.createdAt;
  else if (options.sort === "title") orderColumn = notes.title;

  const order = options.order ?? "desc";
  const finalOrder =
    order === "asc" ? asc(orderColumn) : desc(orderColumn);

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select(summaryColumns)
      .from(notes)
      .where(where)
      .orderBy(finalOrder)
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(notes).where(where),
  ]);

  return {
    notes: rows,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + rows.length < total,
    },
  };
}

export async function getNote(
  workspaceId: string,
  noteId: string,
): Promise<typeof notes.$inferSelect | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.workspaceId, workspaceId)))
    .limit(1);
  return rows.length > 0 ? rows[0] : null;
}

export async function getEditableNote(workspaceId: string, noteId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.id, noteId),
        eq(notes.workspaceId, workspaceId),
        eq(notes.isDeleted, false),
      ),
    )
    .limit(1);
  if (rows.length === 0) {
    throw new NotesError("Note not found", "NOT_FOUND");
  }
  return rows[0];
}

export async function createNote(
  workspaceId: string,
  input: CreateNoteInput,
) {
  const title = input.title.trim();
  if (!title) {
    throw new NotesError("Title is required", "VALIDATION");
  }

  const db = getDb();
  const rows = await db
    .insert(notes)
    .values({
      workspaceId,
      title,
      content: input.content ?? "",
      para: input.para ?? "resource",
      status: input.status ?? "draft",
      isFavorite: input.isFavorite ?? false,
      folderId: input.folderId,
    })
    .returning();
  return rows[0];
}

export async function updateNote(
  workspaceId: string,
  noteId: string,
  input: UpdateNoteInput,
) {
  if (input.title !== undefined && !input.title.trim()) {
    throw new NotesError("Title cannot be empty", "VALIDATION");
  }

  const db = getDb();
  const rows = await db
    .update(notes)
    .set({
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.para !== undefined ? { para: input.para } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.isFavorite !== undefined ? { isFavorite: input.isFavorite } : {}),
      ...(input.folderId !== undefined ? { folderId: input.folderId } : {}),
    })
    .where(and(eq(notes.id, noteId), eq(notes.workspaceId, workspaceId)))
    .returning();

  if (rows.length === 0) {
    throw new NotesError("Note not found", "NOT_FOUND");
  }
  return rows[0];
}

export async function softDeleteNote(workspaceId: string, noteId: string) {
  const db = getDb();
  const rows = await db
    .update(notes)
    .set({ isDeleted: true, deletedAt: sql`now()` })
    .where(and(eq(notes.id, noteId), eq(notes.workspaceId, workspaceId)))
    .returning({ id: notes.id });
  if (rows.length === 0) {
    throw new NotesError("Note not found", "NOT_FOUND");
  }
  return rows[0];
}

export async function restoreNote(workspaceId: string, noteId: string) {
  const db = getDb();
  const rows = await db
    .update(notes)
    .set({ isDeleted: false, deletedAt: sql`null` })
    .where(and(eq(notes.id, noteId), eq(notes.workspaceId, workspaceId)))
    .returning({ id: notes.id });
  if (rows.length === 0) {
    throw new NotesError("Note not found", "NOT_FOUND");
  }
  return rows[0];
}