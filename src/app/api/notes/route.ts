import { NextRequest } from "next/server";
import {
  createNote,
  getOrCreateDefaultWorkspace,
  listNotes,
  NotesError,
} from "@/lib/pkm/notes";
import { fail, ok, readJson, requireUser, serializeNote } from "@/lib/http";
import type { ParaCategory, NoteStatus } from "@/types";

const PARA_VALUES: ParaCategory[] = [
  "inbox",
  "project",
  "area",
  "resource",
  "archive",
];
const STATUS_VALUES: NoteStatus[] = ["inbox", "draft", "evergreen", "archived"];

const isPara = (v: unknown): v is ParaCategory =>
  typeof v === "string" && PARA_VALUES.includes(v as ParaCategory);
const isStatus = (v: unknown): v is NoteStatus =>
  typeof v === "string" && STATUS_VALUES.includes(v as NoteStatus);
const isBool = (v: unknown): v is boolean => typeof v === "boolean";

function parseBool(v: string | null): boolean | undefined {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();

    const sp = req.nextUrl.searchParams;
    const para = sp.get("para");
    const status = sp.get("status");
    const favorite = parseBool(sp.get("favorite"));
    const sort = sp.get("sort");
    const order = sp.get("order");
    const limit = sp.get("limit");
    const offset = sp.get("offset");

    if (para && !isPara(para)) {
      return fail(new NotesError("Invalid para filter", "VALIDATION"));
    }
    if (status && !isStatus(status)) {
      return fail(new NotesError("Invalid status filter", "VALIDATION"));
    }
    if (favorite === undefined && sp.has("favorite")) {
      return fail(new NotesError("Invalid favorite filter", "VALIDATION"));
    }
    if (sort && !["updated_at", "created_at", "title"].includes(sort)) {
      return fail(new NotesError("Invalid sort", "VALIDATION"));
    }
    if (order && !["asc", "desc"].includes(order)) {
      return fail(new NotesError("Invalid order", "VALIDATION"));
    }
    if ((limit && !/^\d+$/.test(limit)) || (offset && !/^\d+$/.test(offset))) {
      return fail(new NotesError("Invalid pagination", "VALIDATION"));
    }

    const result = await listNotes(workspaceId, {
      para: para ? (para as ParaCategory) : undefined,
      status: status ? (status as NoteStatus) : undefined,
      favorite,
      sort: sort as "updated_at" | "created_at" | "title" | undefined,
      order: order as "asc" | "desc" | undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    return ok({
      notes: result.notes.map((n) => ({
        ...n,
        updatedAt: n.updatedAt.toISOString(),
        createdAt: n.createdAt.toISOString(),
      })),
      pagination: result.pagination,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const body = (await readJson(req)) as Record<string, unknown>;

    const title = body.title;
    if (typeof title !== "string" || !title.trim()) {
      return fail(new NotesError("Title is required", "VALIDATION"));
    }
    if (body.content !== undefined && typeof body.content !== "string") {
      return fail(new NotesError("Content must be a string", "VALIDATION"));
    }
    if (body.para !== undefined && !isPara(body.para)) {
      return fail(new NotesError("Invalid para", "VALIDATION"));
    }
    if (body.status !== undefined && !isStatus(body.status)) {
      return fail(new NotesError("Invalid status", "VALIDATION"));
    }
    if (body.isFavorite !== undefined && !isBool(body.isFavorite)) {
      return fail(new NotesError("isFavorite must be boolean", "VALIDATION"));
    }
    if (body.folderId !== undefined && typeof body.folderId !== "number") {
      return fail(new NotesError("folderId must be a number", "VALIDATION"));
    }

    const note = await createNote(workspaceId, {
      title,
      content: typeof body.content === "string" ? body.content : undefined,
      para: body.para as ParaCategory | undefined,
      status: body.status as NoteStatus | undefined,
      isFavorite: body.isFavorite as boolean | undefined,
      folderId: body.folderId as number | undefined,
    });

    return ok({ note: serializeNote(note) }, 201);
  } catch (error) {
    return fail(error);
  }
}