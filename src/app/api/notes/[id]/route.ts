import { NextRequest } from "next/server";
import {
  getEditableNote,
  getOrCreateDefaultWorkspace,
  softDeleteNote,
  updateNote,
  NotesError,
} from "@/lib/pkm/notes";
import {
  fail,
  ok,
  parseId,
  readJson,
  requireUser,
  serializeNote,
} from "@/lib/http";
import type { ParaCategory, NoteStatus } from "@/types";

const PARA_VALUES: ParaCategory[] = [
  "inbox",
  "project",
  "area",
  "resource",
  "archive",
];
const STATUS_VALUES: NoteStatus[] = ["inbox", "draft", "evergreen", "archived"];

function isPara(v: unknown): v is ParaCategory {
  return typeof v === "string" && PARA_VALUES.includes(v as ParaCategory);
}
function isStatus(v: unknown): v is NoteStatus {
  return typeof v === "string" && STATUS_VALUES.includes(v as NoteStatus);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const { id } = await params;
    const noteId = parseId(id);

    const note = await getEditableNote(workspaceId, noteId);
    return ok({ note: serializeNote(note) });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const { id } = await params;
    const noteId = parseId(id);

    const raw = (await readJson(req)) as Record<string, unknown>;
    if (typeof raw !== "object" || raw === null) {
      return fail(new NotesError("Body must be an object", "VALIDATION"));
    }
    if (raw.title !== undefined && typeof raw.title !== "string") {
      return fail(new NotesError("Title must be a string", "VALIDATION"));
    }
    if (raw.content !== undefined && typeof raw.content !== "string") {
      return fail(new NotesError("Content must be a string", "VALIDATION"));
    }
    if (raw.para !== undefined && !isPara(raw.para)) {
      return fail(new NotesError("Invalid para", "VALIDATION"));
    }
    if (raw.status !== undefined && !isStatus(raw.status)) {
      return fail(new NotesError("Invalid status", "VALIDATION"));
    }
    if (raw.isFavorite !== undefined && typeof raw.isFavorite !== "boolean") {
      return fail(new NotesError("isFavorite must be boolean", "VALIDATION"));
    }
    if (
      raw.folderId !== undefined &&
      raw.folderId !== null &&
      typeof raw.folderId !== "number"
    ) {
      return fail(new NotesError("folderId must be a number", "VALIDATION"));
    }

    const note = await updateNote(workspaceId, noteId, {
      title: raw.title as string | undefined,
      content: raw.content as string | undefined,
      para: raw.para as ParaCategory | undefined,
      status: raw.status as NoteStatus | undefined,
      isFavorite: raw.isFavorite as boolean | undefined,
      folderId: raw.folderId as number | null | undefined,
    });

    return ok({ note: serializeNote(note) });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const { id } = await params;
    const noteId = parseId(id);

    await softDeleteNote(workspaceId, noteId);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}