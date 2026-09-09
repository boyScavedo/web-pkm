import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { NotesError } from "@/lib/pkm/notes";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(error: unknown) {
  if (error instanceof NotesError) {
    const status = error.code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status },
    );
  }
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.status },
    );
  }
  console.error(error);
  return NextResponse.json(
    { error: { message: "Internal server error", code: "INTERNAL" } },
    { status: 500 },
  );
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError("Not authenticated", 401, "UNAUTHORIZED");
  }
  return session.user;
}

export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError("Invalid JSON body", 400, "INVALID_JSON");
  }
}

export function parseId(raw: string | undefined): string {
  if (!raw || !/^[0-9a-f-]{36}$/i.test(raw)) {
    throw new ApiError("Invalid note id", 400, "INVALID_ID");
  }
  return raw;
}

// Explicit wire shape for a note row: never spread the drizzle row so
// computed columns (searchVector, workspaceId) can't leak to the client.
export function serializeNote(
  note: {
    id: string;
    title: string;
    content: string;
    format: string;
    slug: string | null;
    coverImage: string | null;
    para: string;
    status: string;
    isFavorite: boolean;
    isTemplate: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    folderId: number | null;
    updatedAt: Date;
    createdAt: Date;
  },
) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    format: note.format,
    slug: note.slug,
    coverImage: note.coverImage,
    para: note.para,
    status: note.status,
    isFavorite: note.isFavorite,
    isTemplate: note.isTemplate,
    isDeleted: note.isDeleted,
    deletedAt: note.deletedAt ? note.deletedAt.toISOString() : null,
    folderId: note.folderId,
    updatedAt: note.updatedAt.toISOString(),
    createdAt: note.createdAt.toISOString(),
  };
}